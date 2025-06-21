from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import io
import PyPDF2
import openai
from openai import AsyncOpenAI
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Environment configuration with defaults for local development
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatpdf_database')
DEEPSEEK_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')

if not DEEPSEEK_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Create OpenRouter client
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=DEEPSEEK_API_KEY,
)

# Create the main app
app = FastAPI(title="Baloch AI chat PdF & GPT API", version="2.0.0")
api_router = APIRouter(prefix="/api")

# Pydantic Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    content: str
    role: str  # 'user' or 'assistant'
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    feature_type: str = "chat"  # 'chat', 'qa_generation', 'general_ai', 'research'

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    pdf_filename: Optional[str] = None
    pdf_content: Optional[str] = None

class PDFDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    content: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_size: int

class SendMessageRequest(BaseModel):
    session_id: str
    content: str
    model: str = "meta-llama/llama-3.1-8b-instruct:free"
    feature_type: str = "chat"

class CreateSessionRequest(BaseModel):
    title: str = "New Chat"

class GenerateQARequest(BaseModel):
    session_id: str
    model: str = "meta-llama/llama-3.1-8b-instruct:free"

class ResearchRequest(BaseModel):
    session_id: str
    research_type: str = "summary"  # 'summary' or 'detailed_research'
    model: str = "meta-llama/llama-3.1-8b-instruct:free"

class ComparePDFsRequest(BaseModel):
    session_ids: List[str]
    comparison_type: str = "content"  # 'content', 'structure', 'summary'
    model: str = "meta-llama/llama-3.1-8b-instruct:free"

class TranslateRequest(BaseModel):
    session_id: str
    target_language: str
    content_type: str = "full"  # 'full', 'summary'
    model: str = "meta-llama/llama-3.1-8b-instruct:free"

class SearchRequest(BaseModel):
    query: str
    search_type: str = "all"  # 'all', 'pdfs', 'conversations'
    limit: int = 20

class ExportRequest(BaseModel):
    session_id: str
    export_format: str = "pdf"  # 'pdf', 'txt', 'docx'
    include_messages: bool = True
    feature_type: Optional[str] = None

# PDF Processing Functions
async def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

# OpenRouter AI Functions
async def get_ai_response(messages: List[Dict], model: str = "meta-llama/llama-3.1-8b-instruct:free") -> str:
    try:
        # Use the OpenRouter client
        response = await openrouter_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# API Routes
@api_router.post("/sessions", response_model=ChatSession)
async def create_session(request: CreateSessionRequest):
    session = ChatSession(
        title=request.title
    )
    await db.chat_sessions.insert_one(session.dict())
    return session

@api_router.get("/sessions", response_model=List[ChatSession])
async def get_sessions():
    sessions = await db.chat_sessions.find().sort("updated_at", -1).to_list(100)
    return [ChatSession(**session) for session in sessions]

@api_router.post("/sessions/{session_id}/upload-pdf")
async def upload_pdf(session_id: str, file: UploadFile = File(...)):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read and process PDF
    file_content = await file.read()
    pdf_text = await extract_text_from_pdf(file_content)
    
    # Save PDF document
    pdf_doc = PDFDocument(
        filename=file.filename,
        content=pdf_text,
        file_size=len(file_content)
    )
    await db.pdf_documents.insert_one(pdf_doc.dict())
    
    # Update session with PDF info
    await db.chat_sessions.update_one(
        {"id": session_id},
        {
            "$set": {
                "pdf_filename": file.filename,
                "pdf_content": pdf_text,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "content_length": len(pdf_text)
    }

@api_router.post("/sessions/{session_id}/messages")
async def send_message(session_id: str, request: SendMessageRequest):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message
    user_message = ChatMessage(
        session_id=session_id,
        content=request.content,
        role="user",
        feature_type=request.feature_type
    )
    await db.chat_messages.insert_one(user_message.dict())
    
    # Get chat history
    messages_cursor = db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1)
    chat_history = await messages_cursor.to_list(100)
    
    # Prepare messages for AI based on feature type
    ai_messages = []
    
    if request.feature_type == "general_ai":
        # General AI chat - no PDF context
        ai_messages.append({
            "role": "system", 
            "content": "You are a helpful AI assistant. Answer any questions the user has with accurate and helpful information."
        })
    else:
        # PDF-based features
        if session.get("pdf_content"):
            pdf_content = session["pdf_content"]
            if request.feature_type == "chat":
                system_message = f"""You are an AI assistant specialized in analyzing PDF documents. 

PDF Content:
{pdf_content[:4000]}...

Please answer questions based on this PDF content. Be specific and reference the document when possible."""
            
            ai_messages.append({"role": "system", "content": system_message})
        else:
            ai_messages.append({
                "role": "system", 
                "content": "You are a helpful AI assistant. No PDF has been uploaded yet. Please ask the user to upload a PDF document first."
            })
    
    # Add recent conversation history
    for msg in chat_history[-10:]:  # Last 10 messages for context
        if msg["feature_type"] == request.feature_type or request.feature_type == "chat":
            ai_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    
    # Get AI response
    ai_response = await get_ai_response(ai_messages, request.model)
    
    # Save AI message
    ai_message = ChatMessage(
        session_id=session_id,
        content=ai_response,
        role="assistant",
        feature_type=request.feature_type
    )
    await db.chat_messages.insert_one(ai_message.dict())
    
    # Update session timestamp
    await db.chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return ai_message

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    # Delete session
    result = await db.chat_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete associated messages
    await db.chat_messages.delete_many({"session_id": session_id})
    
    return {"message": "Session deleted successfully"}

@api_router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_messages(session_id: str, feature_type: Optional[str] = Query(None)):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Build query
    query = {"session_id": session_id}
    if feature_type:
        query["feature_type"] = feature_type
    
    messages = await db.chat_messages.find(query).sort("timestamp", 1).to_list(1000)
    return [ChatMessage(**message) for message in messages]

@api_router.get("/models")
async def get_available_models():
    models = [
        {
            "id": "meta-llama/llama-3.1-8b-instruct:free",
            "name": "Llama 3.1 8B Instruct (Free)",
            "provider": "Meta",
            "free": True
        },
        {
            "id": "google/gemma-2-9b-it:free",
            "name": "Gemma 2 9B IT (Free)",
            "provider": "Google",
            "free": True
        },
        {
            "id": "mistralai/mistral-7b-instruct:free",
            "name": "Mistral 7B Instruct (Free)",
            "provider": "Mistral AI",
            "free": True
        },
        {
            "id": "qwen/qwen-2-7b-instruct:free",
            "name": "Qwen 2 7B Instruct (Free)",
            "provider": "Qwen",
            "free": True
        },
        {
            "id": "microsoft/phi-3-mini-128k-instruct:free",
            "name": "Phi 3 Mini 128K Instruct (Free)",
            "provider": "Microsoft",
            "free": True
        }
    ]
    return {"models": models}

@api_router.post("/compare-pdfs")
async def compare_pdfs(request: ComparePDFsRequest):
    # Verify all sessions exist and have PDFs
    sessions_data = []
    for session_id in request.session_ids:
        session = await db.chat_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        if not session.get("pdf_content"):
            raise HTTPException(status_code=400, detail=f"Session {session_id} has no PDF uploaded")
        sessions_data.append(session)
    
    if len(sessions_data) < 2:
        raise HTTPException(status_code=400, detail="At least 2 sessions with PDFs are required for comparison")
    
    # Prepare comparison prompt based on type
    comparison_prompts = {
        "content": "Compare the content and key information in these PDF documents. Highlight similarities, differences, and unique aspects of each document.",
        "structure": "Analyze and compare the structure, organization, and format of these PDF documents. Focus on how information is presented and organized.",
        "summary": "Provide a comparative summary of these PDF documents, highlighting the main themes, conclusions, and key takeaways from each."
    }
    
    prompt = comparison_prompts.get(request.comparison_type, comparison_prompts["content"])
    
    # Combine PDF contents for comparison
    combined_content = f"{prompt}\n\n"
    for i, session in enumerate(sessions_data, 1):
        pdf_filename = session.get("pdf_filename", f"Document {i}")
        pdf_content = session["pdf_content"][:2000]  # Limit content length
        combined_content += f"Document {i} ({pdf_filename}):\n{pdf_content}\n\n"
    
    ai_messages = [
        {"role": "system", "content": "You are an AI assistant specialized in document analysis and comparison."},
        {"role": "user", "content": combined_content}
    ]
    
    # Get AI comparison
    comparison_result = await get_ai_response(ai_messages, request.model)
    
    # Save comparison as message in first session
    comparison_message = ChatMessage(
        session_id=request.session_ids[0],
        content=f"PDF Comparison ({request.comparison_type}):\n{comparison_result}",
        role="assistant",
        feature_type="comparison"
    )
    await db.chat_messages.insert_one(comparison_message.dict())
    
    return {
        "comparison_type": request.comparison_type,
        "sessions_compared": len(sessions_data),
        "result": comparison_result
    }

@api_router.post("/generate-qa")
async def generate_qa(request: GenerateQARequest):
    # Verify session exists and has PDF
    session = await db.chat_sessions.find_one({"id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"][:4000]  # Limit content length
    
    ai_messages = [
        {
            "role": "system", 
            "content": "You are an AI assistant that generates comprehensive question-answer pairs based on document content. Create relevant, thoughtful questions and provide detailed answers."
        },
        {
            "role": "user", 
            "content": f"""Based on the following PDF content, generate 5-7 comprehensive question-answer pairs that cover the main topics and important details:

PDF Content:
{pdf_content}

Format your response as:
Q1: [Question]
A1: [Detailed Answer]

Q2: [Question]
A2: [Detailed Answer]

etc."""
        }
    ]
    
    qa_result = await get_ai_response(ai_messages, request.model)
    
    # Save Q&A as message
    qa_message = ChatMessage(
        session_id=request.session_id,
        content=f"Generated Q&A:\n{qa_result}",
        role="assistant",
        feature_type="qa_generation"
    )
    await db.chat_messages.insert_one(qa_message.dict())
    
    return {
        "session_id": request.session_id,
        "qa_pairs": qa_result
    }

@api_router.post("/research")
async def research_pdf(request: ResearchRequest):
    # Verify session exists and has PDF
    session = await db.chat_sessions.find_one({"id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"][:4000]  # Limit content length
    
    # Different research prompts based on type
    research_prompts = {
        "summary": "Provide a comprehensive summary of this document, highlighting key points, main arguments, and important conclusions.",
        "detailed_research": "Conduct a detailed research analysis of this document. Include key themes, methodologies (if applicable), findings, implications, and potential areas for further investigation."
    }
    
    prompt = research_prompts.get(request.research_type, research_prompts["summary"])
    
    ai_messages = [
        {
            "role": "system", 
            "content": "You are an AI research assistant specialized in document analysis. Provide thorough, academic-quality research insights."
        },
        {
            "role": "user", 
            "content": f"""{prompt}

PDF Content:
{pdf_content}"""
        }
    ]
    
    research_result = await get_ai_response(ai_messages, request.model)
    
    # Save research as message
    research_message = ChatMessage(
        session_id=request.session_id,
        content=f"Research Analysis ({request.research_type}):\n{research_result}",
        role="assistant",
        feature_type="research"
    )
    await db.chat_messages.insert_one(research_message.dict())
    
    return {
        "session_id": request.session_id,
        "research_type": request.research_type,
        "analysis": research_result
    }

@api_router.post("/translate")
async def translate_pdf(request: TranslateRequest):
    # Verify session exists and has PDF
    session = await db.chat_sessions.find_one({"id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"]
    
    # Limit content based on type
    if request.content_type == "summary":
        content_to_translate = pdf_content[:2000]
        translation_instruction = f"Provide a translated summary of this document in {request.target_language}:"
    else:
        content_to_translate = pdf_content[:4000]
        translation_instruction = f"Translate this document content to {request.target_language}:"
    
    ai_messages = [
        {
            "role": "system", 
            "content": f"You are a professional translator. Translate the given content accurately to {request.target_language} while maintaining the original meaning and context."
        },
        {
            "role": "user", 
            "content": f"""{translation_instruction}

{content_to_translate}"""
        }
    ]
    
    translation_result = await get_ai_response(ai_messages, request.model)
    
    # Save translation as message
    translation_message = ChatMessage(
        session_id=request.session_id,
        content=f"Translation to {request.target_language} ({request.content_type}):\n{translation_result}",
        role="assistant",
        feature_type="translation"
    )
    await db.chat_messages.insert_one(translation_message.dict())
    
    return {
        "session_id": request.session_id,
        "target_language": request.target_language,
        "content_type": request.content_type,
        "translation": translation_result
    }

@api_router.post("/search")
async def advanced_search(request: SearchRequest):
    results = []
    
    if request.search_type in ["all", "pdfs"]:
        # Search in PDF documents
        pdf_query = {"content": {"$regex": request.query, "$options": "i"}}
        pdf_docs = await db.pdf_documents.find(pdf_query).limit(request.limit).to_list(request.limit)
        
        for doc in pdf_docs:
            # Find snippet around the search term
            content = doc["content"]
            query_lower = request.query.lower()
            content_lower = content.lower()
            
            if query_lower in content_lower:
                start_idx = max(0, content_lower.find(query_lower) - 100)
                end_idx = min(len(content), start_idx + 300)
                snippet = content[start_idx:end_idx]
                
                results.append({
                    "type": "pdf",
                    "filename": doc["filename"],
                    "snippet": snippet,
                    "upload_date": doc["upload_date"],
                    "relevance_score": content_lower.count(query_lower)
                })
    
    if request.search_type in ["all", "conversations"]:
        # Search in chat messages
        msg_query = {"content": {"$regex": request.query, "$options": "i"}}
        messages = await db.chat_messages.find(msg_query).limit(request.limit).to_list(request.limit)
        
        for msg in messages:
            # Get session info for context
            session = await db.chat_sessions.find_one({"id": msg["session_id"]})
            session_title = session["title"] if session else "Unknown Session"
            
            results.append({
                "type": "conversation",
                "session_title": session_title,
                "session_id": msg["session_id"],
                "content": msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"],
                "timestamp": msg["timestamp"],
                "feature_type": msg["feature_type"]
            })
    
    # Sort results by relevance/recency
    results.sort(key=lambda x: x.get("relevance_score", 1) if x["type"] == "pdf" else 1, reverse=True)
    
    return {
        "query": request.query,
        "search_type": request.search_type,
        "total_results": len(results),
        "results": results[:request.limit]
    }

@api_router.post("/export")
async def export_conversation(request: ExportRequest):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get messages based on filter
    query = {"session_id": request.session_id}
    if request.feature_type:
        query["feature_type"] = request.feature_type
    
    messages = await db.chat_messages.find(query).sort("timestamp", 1).to_list(1000)
    
    # Format content for export
    export_content = f"Chat Session: {session['title']}\n"
    export_content += f"Created: {session['created_at']}\n"
    if session.get('pdf_filename'):
        export_content += f"PDF: {session['pdf_filename']}\n"
    export_content += "\n" + "="*50 + "\n\n"
    
    for msg in messages:
        role_label = "User" if msg["role"] == "user" else "Assistant"
        export_content += f"[{msg['timestamp']}] {role_label}:\n{msg['content']}\n\n"
    
    if request.export_format == "txt":
        # Return plain text
        from fastapi.responses import Response
        return Response(
            content=export_content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={session['title']}.txt"}
        )
    elif request.export_format == "pdf":
        # Generate PDF using reportlab
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Add title
        title = Paragraph(f"Chat Session: {session['title']}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Add messages
        for msg in messages:
            role_label = "User" if msg["role"] == "user" else "Assistant"
            header = Paragraph(f"{role_label} ({msg['timestamp']}):", styles['Heading2'])
            content = Paragraph(msg['content'], styles['Normal'])
            story.append(header)
            story.append(content)
            story.append(Spacer(1, 12))
        
        doc.build(story)
        buffer.seek(0)
        
        from fastapi.responses import Response
        return Response(
            content=buffer.read(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={session['title']}.pdf"}
        )
    elif request.export_format == "docx":
        # Generate DOCX using python-docx
        from docx import Document
        from io import BytesIO
        
        doc = Document()
        doc.add_heading(f"Chat Session: {session['title']}", 0)
        
        # Add session info
        doc.add_paragraph(f"Created: {session['created_at']}")
        if session.get('pdf_filename'):
            doc.add_paragraph(f"PDF: {session['pdf_filename']}")
        
        # Add messages
        for msg in messages:
            role_label = "User" if msg["role"] == "user" else "Assistant"
            doc.add_heading(f"{role_label} ({msg['timestamp']})", level=2)
            doc.add_paragraph(msg['content'])
        
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        from fastapi.responses import Response
        return Response(
            content=buffer.read(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={session['title']}.docx"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

@api_router.get("/insights")
async def get_insights():
    # Get total sessions
    total_sessions = await db.chat_sessions.count_documents({})
    
    # Get total messages
    total_messages = await db.chat_messages.count_documents({})
    
    # Get total PDFs uploaded
    total_pdfs = await db.pdf_documents.count_documents({})
    
    # Get feature usage statistics
    feature_usage = await db.chat_messages.aggregate([
        {"$group": {"_id": "$feature_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(10)
    
    # Get popular PDFs (most referenced)
    popular_pdfs = await db.chat_sessions.aggregate([
        {"$match": {"pdf_filename": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$pdf_filename", "usage_count": {"$sum": 1}}},
        {"$sort": {"usage_count": -1}},
        {"$limit": 5}
    ]).to_list(5)
    
    # Get daily usage for last 7 days
    from datetime import datetime, timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    daily_usage = await db.chat_messages.aggregate([
        {"$match": {"timestamp": {"$gte": seven_days_ago}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$timestamp"
                    }
                },
                "message_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]).to_list(7)
    
    return {
        "overview": {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "total_pdfs": total_pdfs
        },
        "feature_usage": feature_usage,
        "popular_pdfs": popular_pdfs,
        "daily_usage": daily_usage
    }

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Baloch AI chat PdF & GPT Backend starting up...")
    logger.info(f"📊 MongoDB URL: {MONGO_URL}")
    logger.info(f"🗄️  Database: {DB_NAME}")
    logger.info(f"🆓 DeepSeek API Key: {'✅ Configured' if DEEPSEEK_API_KEY else '❌ Missing'}")
    logger.info("✅ Baloch AI chat PdF & GPT Backend ready!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("🛑 Shutting down Baloch AI chat PdF & GPT Backend...")
    client.close()
    logger.info("✅ Database connection closed")

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}