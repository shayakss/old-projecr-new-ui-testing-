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
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
DEEPSEEK_R1_QWEN_API_KEY = os.environ.get('DEEPSEEK_R1_QWEN_API_KEY', '')
DEEPSEEK_R1_FREE_API_KEY = os.environ.get('DEEPSEEK_R1_FREE_API_KEY', '')

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Create multiple OpenRouter clients for different API keys
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

deepseek_qwen_client = None
if DEEPSEEK_R1_QWEN_API_KEY:
    deepseek_qwen_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=DEEPSEEK_R1_QWEN_API_KEY,
    )

deepseek_free_client = None
if DEEPSEEK_R1_FREE_API_KEY:
    deepseek_free_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=DEEPSEEK_R1_FREE_API_KEY,
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
        # Select the appropriate client based on the model
        client_to_use = openrouter_client  # default client
        
        if model in ["deepseek/r1-0528-qwen", "deepseek/r1-0528-qwen3-8b"]:
            if deepseek_qwen_client:
                client_to_use = deepseek_qwen_client
            else:
                raise HTTPException(status_code=500, detail="Deepseek Qwen API key not configured")
        elif model in ["deepseek/r1-0528:free", "deepseek/r1-0528-free"]:
            if deepseek_free_client:
                client_to_use = deepseek_free_client
            else:
                raise HTTPException(status_code=500, detail="Deepseek free API key not configured")
        
        response = await client_to_use.chat.completions.create(
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
    
    return {
        "user_message": user_message,
        "ai_response": ai_message
    }

@api_router.post("/sessions/{session_id}/generate-qa")
async def generate_qa(session_id: str, request: GenerateQARequest):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"]
    
    # Create system message for Q&A generation
    system_message = f"""You are an expert at creating educational questions and answers from documents. 

Based on the following PDF content, generate exactly 15 comprehensive question-and-answer pairs that cover the key concepts, facts, and insights from the document.

PDF Content:
{pdf_content[:5000]}...

Format your response as:
Q1: [Question]
A1: [Answer]

Q2: [Question]
A2: [Answer]

... and so on for all 15 Q&A pairs.

Make the questions diverse, covering different aspects of the document, from basic facts to deeper analytical questions."""
    
    ai_messages = [{"role": "system", "content": system_message}]
    
    # Get AI response
    qa_response = await get_ai_response(ai_messages, request.model)
    
    # Save Q&A generation message
    qa_message = ChatMessage(
        session_id=session_id,
        content=qa_response,
        role="assistant",
        feature_type="qa_generation"
    )
    await db.chat_messages.insert_one(qa_message.dict())
    
    # Update session timestamp
    await db.chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {
        "qa_content": qa_response,
        "message": "Q&A generated successfully"
    }

@api_router.post("/sessions/{session_id}/research")
async def research_pdf(session_id: str, request: ResearchRequest):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"]
    
    if request.research_type == "summary":
        system_message = f"""You are an expert at document analysis and summarization.

Please provide a comprehensive summary of the following PDF document. Include:
1. Main topic and purpose
2. Key points and findings
3. Important conclusions
4. Notable data or statistics
5. Any recommendations or implications

PDF Content:
{pdf_content[:5000]}...

Provide a well-structured, detailed summary that captures the essence of the document."""
    
    else:  # detailed_research
        system_message = f"""You are a research analyst providing detailed analysis of documents.

Please conduct a thorough analysis of the following PDF document and provide:

1. **Executive Summary**: Brief overview of the document
2. **Key Topics Analysis**: Detailed breakdown of main topics
3. **Important Insights**: Notable findings and insights
4. **Data Analysis**: Any statistics, numbers, or data points
5. **Methodology**: If applicable, research methods used
6. **Conclusions**: Main conclusions and implications
7. **Recommendations**: Suggested actions or next steps
8. **Areas for Further Research**: What questions remain unanswered

PDF Content:
{pdf_content[:5000]}...

Provide a comprehensive research analysis that would be suitable for academic or professional use."""
    
    ai_messages = [{"role": "system", "content": system_message}]
    
    # Get AI response
    research_response = await get_ai_response(ai_messages, request.model)
    
    # Save research message
    research_message = ChatMessage(
        session_id=session_id,
        content=research_response,
        role="assistant",
        feature_type="research"
    )
    await db.chat_messages.insert_one(research_message.dict())
    
    # Update session timestamp
    await db.chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {
        "research_content": research_response,
        "research_type": request.research_type,
        "message": f"{request.research_type.title()} completed successfully"
    }

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
    return {
        "models": [
            {
                "id": "meta-llama/llama-3.1-8b-instruct:free",
                "name": "Llama 3.1 8B",
                "provider": "Meta",
                "free": True
            },
            {
                "id": "google/gemma-2-9b-it:free",
                "name": "Gemma 2 9B",
                "provider": "Google",
                "free": True
            },
            {
                "id": "mistralai/mistral-7b-instruct:free",
                "name": "Mistral 7B",
                "provider": "Mistral AI",
                "free": True
            },
            {
                "id": "qwen/qwen-2-7b-instruct:free",
                "name": "Qwen 2 7B",
                "provider": "Alibaba",
                "free": True
            }
        ]
    }

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
    
    # Prepare comparison content
    pdf_contents = []
    for i, session in enumerate(sessions_data):
        pdf_contents.append(f"Document {i+1} ({session['pdf_filename']}):\n{session['pdf_content'][:3000]}...")
    
    if request.comparison_type == "content":
        system_message = f"""You are an expert document analyst. Compare the following PDF documents and provide a detailed analysis.

{chr(10).join(pdf_contents)}

Please provide:
1. **Key Similarities**: What themes, topics, or content do these documents share?
2. **Major Differences**: How do these documents differ in approach, conclusions, or focus?
3. **Unique Insights**: What unique perspectives or information does each document provide?
4. **Comparative Analysis**: Which document is more comprehensive on specific topics?
5. **Recommendations**: Based on the comparison, what would you recommend for someone studying this topic?

Provide a thorough comparative analysis."""
    
    elif request.comparison_type == "structure":
        system_message = f"""Analyze the structure and organization of these PDF documents:

{chr(10).join(pdf_contents)}

Compare:
1. **Document Structure**: How are the documents organized (sections, chapters, etc.)?
2. **Information Hierarchy**: How is information prioritized and presented?
3. **Writing Style**: Academic, technical, conversational, etc.
4. **Content Depth**: Level of detail and complexity
5. **Target Audience**: Who appears to be the intended reader?
6. **Effectiveness**: Which structure better serves its purpose?"""
    
    else:  # summary comparison
        system_message = f"""Provide a concise comparative summary of these documents:

{chr(10).join(pdf_contents)}

Include:
1. **Main Topics**: Core subjects covered in each document
2. **Key Points**: Most important takeaways from each
3. **Overlapping Content**: What information is shared between documents
4. **Distinct Content**: What's unique to each document
5. **Overall Assessment**: Brief evaluation of each document's value"""
    
    ai_messages = [{"role": "system", "content": system_message}]
    
    # Get AI response
    comparison_result = await get_ai_response(ai_messages, request.model)
    
    return {
        "comparison_result": comparison_result,
        "documents_compared": [{"session_id": s["id"], "filename": s["pdf_filename"]} for s in sessions_data],
        "comparison_type": request.comparison_type,
        "message": "PDF comparison completed successfully"
    }

@api_router.post("/sessions/{session_id}/translate")
async def translate_pdf(session_id: str, request: TranslateRequest):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"]
    
    if request.content_type == "summary":
        # First get a summary, then translate it
        summary_prompt = f"""Summarize the following document in English first:

{pdf_content[:4000]}...

Provide a clear, comprehensive summary of the main points."""
        
        summary_response = await get_ai_response([{"role": "system", "content": summary_prompt}], request.model)
        content_to_translate = summary_response
    else:
        content_to_translate = pdf_content[:5000]  # Limit content for translation
    
    # Translation prompt
    system_message = f"""You are a professional translator. Translate the following text to {request.target_language}. 
    
Maintain the original meaning, tone, and structure. If technical terms don't have direct translations, provide the closest equivalent and add the original term in parentheses.

Text to translate:
{content_to_translate}

Provide only the translation, no additional commentary."""
    
    ai_messages = [{"role": "system", "content": system_message}]
    
    # Get translation
    translation_result = await get_ai_response(ai_messages, request.model)
    
    # Save translation as a message
    translation_message = ChatMessage(
        session_id=session_id,
        content=f"🌐 Translation to {request.target_language}:\n\n{translation_result}",
        role="assistant",
        feature_type="translation"
    )
    await db.chat_messages.insert_one(translation_message.dict())
    
    return {
        "translation": translation_result,
        "target_language": request.target_language,
        "content_type": request.content_type,
        "message": "Translation completed successfully"
    }

@api_router.post("/search")
async def advanced_search(request: SearchRequest):
    results = []
    
    if request.search_type in ["all", "pdfs"]:
        # Search in PDF documents
        pdf_cursor = db.pdf_documents.find(
            {"content": {"$regex": request.query, "$options": "i"}},
            {"_id": 0}
        ).limit(request.limit // 2 if request.search_type == "all" else request.limit)
        
        pdf_docs = await pdf_cursor.to_list(None)
        for doc in pdf_docs:
            # Find snippet around the match
            content_lower = doc["content"].lower()
            query_lower = request.query.lower()
            match_index = content_lower.find(query_lower)
            
            if match_index != -1:
                start = max(0, match_index - 100)
                end = min(len(doc["content"]), match_index + 200)
                snippet = doc["content"][start:end]
                
                results.append({
                    "type": "pdf",
                    "filename": doc["filename"],
                    "snippet": f"...{snippet}...",
                    "upload_date": doc["upload_date"],
                    "relevance_score": content_lower.count(query_lower)
                })
    
    if request.search_type in ["all", "conversations"]:
        # Search in chat messages
        messages_cursor = db.chat_messages.find(
            {"content": {"$regex": request.query, "$options": "i"}},
            {"_id": 0}
        ).limit(request.limit // 2 if request.search_type == "all" else request.limit)
        
        messages = await messages_cursor.to_list(None)
        for msg in messages:
            # Get session info
            session = await db.chat_sessions.find_one({"id": msg["session_id"]})
            
            results.append({
                "type": "conversation",
                "session_title": session.get("title", "Untitled Session") if session else "Unknown Session",
                "session_id": msg["session_id"],
                "content": msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"],
                "role": msg["role"],
                "timestamp": msg["timestamp"],
                "feature_type": msg["feature_type"]
            })
    
    # Sort by relevance (for now, just by timestamp for conversations and by match count for PDFs)
    def sort_key(item):
        if item["type"] == "pdf":
            return item.get("relevance_score", 0)
        else:
            return item["timestamp"]
    
    results.sort(key=sort_key, reverse=True)
    
    return {
        "results": results[:request.limit],
        "total_found": len(results),
        "query": request.query,
        "search_type": request.search_type
    }

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete messages and session
    await db.chat_messages.delete_many({"session_id": session_id})
    await db.chat_sessions.delete_one({"id": session_id})
    
    return {"message": "Session deleted successfully"}

@api_router.post("/sessions/{session_id}/export")
async def export_conversation(session_id: str, request: ExportRequest):
    # Verify session exists
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get messages
    query = {"session_id": session_id}
    if request.feature_type:
        query["feature_type"] = request.feature_type
    
    messages = await db.chat_messages.find(query).sort("timestamp", 1).to_list(1000)
    
    # Prepare export content
    export_content = f"Chat Session Export: {session.get('title', 'Untitled Session')}\n"
    export_content += f"PDF: {session.get('pdf_filename', 'No PDF uploaded')}\n"
    export_content += f"Export Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}\n"
    export_content += "=" * 50 + "\n\n"
    
    if request.include_messages:
        for msg in messages:
            timestamp = msg["timestamp"]
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            role_label = "You" if msg["role"] == "user" else "AI Assistant"
            export_content += f"[{timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {role_label}:\n"
            export_content += f"{msg['content']}\n\n"
    
    # For this MVP, we'll return the content as text
    # In a full implementation, you'd generate actual PDF/DOCX files
    if request.export_format == "txt":
        content_type = "text/plain"
        filename = f"chat_export_{session_id}.txt"
    elif request.export_format == "pdf":
        content_type = "application/pdf"
        filename = f"chat_export_{session_id}.pdf"
        # For PDF, we'd use a library like reportlab
        export_content = f"PDF Export functionality would generate a formatted PDF with this content:\n\n{export_content}"
    elif request.export_format == "docx":
        content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"chat_export_{session_id}.docx"
        # For DOCX, we'd use python-docx
        export_content = f"DOCX Export functionality would generate a formatted Word document with this content:\n\n{export_content}"
    
    return {
        "content": export_content,
        "filename": filename,
        "content_type": content_type,
        "message": f"Conversation exported successfully as {request.export_format.upper()}"
    }

@api_router.get("/insights/dashboard")
async def get_insights_dashboard():
    # Get total counts
    total_sessions = await db.chat_sessions.count_documents({})
    total_pdfs = await db.pdf_documents.count_documents({})
    total_messages = await db.chat_messages.count_documents({})
    
    # Get recent activity
    recent_sessions = await db.chat_sessions.find().sort("updated_at", -1).limit(5).to_list(5)
    recent_sessions_data = [
        {
            "id": session["id"],
            "title": session["title"],
            "pdf_filename": session.get("pdf_filename"),
            "updated_at": session["updated_at"]
        }
        for session in recent_sessions
    ]
    
    # Get message statistics by feature type
    pipeline = [
        {"$group": {"_id": "$feature_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    feature_stats = await db.chat_messages.aggregate(pipeline).to_list(None)
    
    # Get top PDF files by message count
    pipeline = [
        {"$lookup": {
            "from": "chat_sessions",
            "localField": "session_id",
            "foreignField": "id",
            "as": "session"
        }},
        {"$unwind": "$session"},
        {"$match": {"session.pdf_filename": {"$exists": True, "$ne": None}}},
        {"$group": {
            "_id": "$session.pdf_filename",
            "message_count": {"$sum": 1},
            "last_used": {"$max": "$timestamp"}
        }},
        {"$sort": {"message_count": -1}},
        {"$limit": 5}
    ]
    popular_pdfs = await db.chat_messages.aggregate(pipeline).to_list(None)
    
    # Calculate usage patterns (messages per day for last 7 days)
    from datetime import timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": seven_days_ago}}},
        {"$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$timestamp"
                }
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily_usage = await db.chat_messages.aggregate(pipeline).to_list(None)
    
    return {
        "overview": {
            "total_sessions": total_sessions,
            "total_pdfs": total_pdfs,
            "total_messages": total_messages,
            "avg_messages_per_session": total_messages / max(total_sessions, 1)
        },
        "recent_activity": recent_sessions_data,
        "feature_usage": feature_stats,
        "popular_pdfs": popular_pdfs,
        "daily_usage": daily_usage,
        "generated_at": datetime.utcnow()
    }

# Include the router in the main app
app.include_router(api_router)

# CORS configuration - allows both production and local development
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    logger.info(f"🤖 OpenRouter API Key: {'✅ Configured' if OPENROUTER_API_KEY else '❌ Missing'}")
    logger.info("✅ Baloch AI chat PdF & GPT Backend ready!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("🛑 Shutting down Baloch AI chat PdF & GPT Backend...")
    client.close()
    logger.info("✅ Database connection closed")