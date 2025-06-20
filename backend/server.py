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

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# Create the main app
app = FastAPI(title="ChatPDF API", version="2.0.0")
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
