# Complete ChatPDF Backend Server
# This is the main server file - copy this entire content to your local backend/server.py

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
import httpx
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import psutil
import subprocess
import sys
import pkg_resources
from typing import Union
import asyncio
import time
import threading

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Environment configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatpdf_database')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Log startup information
logger.info("=== ChatPDF Backend Starting ===")
logger.info(f"MongoDB URL: {MONGO_URL}")
logger.info(f"Database: {DB_NAME}")
logger.info(f"Python version: {sys.version}")
logger.info("===================================")

# Load multiple OpenRouter API keys for load balancing and fallback
OPENROUTER_API_KEYS = []
for i in range(1, 6):  # Load up to 5 keys
    key_name = 'OPENROUTER_API_KEY' if i == 1 else f'OPENROUTER_API_KEY_{i}'
    key_value = os.environ.get(key_name, '')
    if key_value:
        OPENROUTER_API_KEYS.append(key_value)

# Load multiple Gemini API keys for load balancing and fallback
GEMINI_API_KEYS = []
for i in range(1, 5):  # Load up to 4 keys
    key_name = 'GEMINI_API_KEY' if i == 1 else f'GEMINI_API_KEY_{i}'
    key_value = os.environ.get(key_name, '')
    if key_value:
        GEMINI_API_KEYS.append(key_value)

# Backward compatibility - set primary keys
OPENROUTER_API_KEY = OPENROUTER_API_KEYS[0] if OPENROUTER_API_KEYS else ''
GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else ''

# Log API key configuration
logger.info(f"OpenRouter API Keys loaded: {len(OPENROUTER_API_KEYS)}")
for i, key in enumerate(OPENROUTER_API_KEYS):
    logger.info(f"  Key {i+1}: ...{key[-10:]}")

logger.info(f"Gemini API Keys loaded: {len(GEMINI_API_KEYS)}")
for i, key in enumerate(GEMINI_API_KEYS):
    logger.info(f"  Key {i+1}: ...{key[-10:]}")

# Add counters for round-robin load balancing
import threading
_openrouter_key_counter = threading.local()
_gemini_key_counter = threading.local()

def get_next_openrouter_key():
    """Get the next OpenRouter API key using round-robin load balancing"""
    if not OPENROUTER_API_KEYS:
        return ''
    
    if not hasattr(_openrouter_key_counter, 'value'):
        _openrouter_key_counter.value = 0
    
    key = OPENROUTER_API_KEYS[_openrouter_key_counter.value % len(OPENROUTER_API_KEYS)]
    _openrouter_key_counter.value += 1
    return key

def get_next_gemini_key():
    """Get the next Gemini API key using round-robin load balancing"""
    if not GEMINI_API_KEYS:
        return ''
    
    if not hasattr(_gemini_key_counter, 'value'):
        _gemini_key_counter.value = 0
    
    key = GEMINI_API_KEYS[_gemini_key_counter.value % len(GEMINI_API_KEYS)]
    _gemini_key_counter.value += 1
    return key

# Configure CORS for local development
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001"
]

# Validate that we have at least one AI provider configured
if not OPENROUTER_API_KEYS and not GEMINI_API_KEYS:
    logger.warning("No AI provider API keys configured. Some features may not work.")

# MongoDB connection
try:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    logger.info("MongoDB client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB client: {e}")
    raise

# OpenRouter API configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Create the main app
app = FastAPI(title="ChatPDF API", version="2.0.0")
api_router = APIRouter(prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Functions
def is_gemini_model(model: str) -> bool:
    """Check if the model is a Gemini model"""
    gemini_models = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro'
    ]
    return model in gemini_models

async def get_ai_response_gemini(messages: List[Dict], model: str) -> str:
    """Handle Gemini API requests using emergentintegrations with load balancing and fallback"""
    if not GEMINI_API_KEYS:
        raise HTTPException(status_code=500, detail="No Gemini API keys configured")
    
    # Try each API key with fallback logic
    last_error = None
    
    for attempt in range(len(GEMINI_API_KEYS)):
        # Get next key using round-robin
        api_key = get_next_gemini_key()
        
        try:
            # Create a unique session ID for this conversation
            session_id = str(uuid.uuid4())
            
            # Extract system message
            system_message = next((msg["content"] for msg in messages if msg["role"] == "system"), "You are a helpful assistant.")
            
            # Initialize LlmChat with Gemini
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("gemini", model)
            
            # Get the last user message (most recent)
            user_messages = [msg for msg in messages if msg["role"] == "user"]
            if not user_messages:
                raise HTTPException(status_code=400, detail="No user message found")
            
            last_user_message = user_messages[-1]["content"]
            
            # Create UserMessage and send
            user_message = UserMessage(text=last_user_message)
            response = await chat.send_message(user_message)
            
            return response
            
        except Exception as e:
            last_error = e
            logger.warning(f"Gemini API key {api_key[-10:]}... failed (attempt {attempt + 1}/{len(GEMINI_API_KEYS)}): {str(e)}")
            continue
    
    # If all keys failed, raise the last error
    raise HTTPException(status_code=500, detail=f"All Gemini API keys failed. Last error: {str(last_error)}")

async def get_ai_response_openrouter(messages: List[Dict], model: str) -> str:
    """Handle OpenRouter API requests (Claude models) with load balancing and fallback"""
    if not OPENROUTER_API_KEYS:
        raise HTTPException(status_code=500, detail="No OpenRouter API keys configured")
    
    # Convert chat format to OpenRouter format
    system_message = next((msg["content"] for msg in messages if msg["role"] == "system"), None)
    chat_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages if msg["role"] != "system"]
    
    # Try each API key with fallback logic
    last_error = None
    
    for attempt in range(len(OPENROUTER_API_KEYS)):
        # Get next key using round-robin
        api_key = get_next_openrouter_key()
        
        try:
            # Use OpenRouter API
            async with httpx.AsyncClient() as http_client:
                response = await http_client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "HTTP-Referer": "https://github.com/chatpdf",
                        "X-Title": "ChatPDF App"
                    },
                    json={
                        "model": model,
                        "messages": chat_messages,
                        "system": system_message,
                        "max_tokens": 2000,
                        "temperature": 0.7
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
        except Exception as e:
            last_error = e
            logger.warning(f"OpenRouter API key {api_key[-10:]}... failed (attempt {attempt + 1}/{len(OPENROUTER_API_KEYS)}): {str(e)}")
            continue
    
    # If all keys failed, raise the last error
    raise HTTPException(status_code=500, detail=f"All OpenRouter API keys failed. Last error: {str(last_error)}")

async def get_ai_response(messages: List[Dict], model: str = "claude-3-opus-20240229") -> str:
    """Route AI requests to appropriate provider based on model"""
    try:
        if is_gemini_model(model):
            if not GEMINI_API_KEYS:
                raise HTTPException(status_code=500, detail="Gemini API keys not configured")
            return await get_ai_response_gemini(messages, model)
        else:
            if not OPENROUTER_API_KEYS:
                raise HTTPException(status_code=500, detail="OpenRouter API keys not configured")
            return await get_ai_response_openrouter(messages, model)
    except Exception as e:
        # If there's an error with the primary provider, try the backup
        if is_gemini_model(model) and OPENROUTER_API_KEYS:
            # If Gemini fails, try with a Claude model as backup
            logger.warning(f"Gemini model {model} failed, trying Claude backup: {str(e)}")
            return await get_ai_response_openrouter(messages, "claude-3-haiku-20240307")
        elif not is_gemini_model(model) and GEMINI_API_KEYS:
            # If Claude fails, try with Gemini as backup
            logger.warning(f"Claude model {model} failed, trying Gemini backup: {str(e)}")
            return await get_ai_response_gemini(messages, "gemini-1.5-flash")
        else:
            raise e

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 ChatPDF Backend starting up...")
    logger.info(f"📊 MongoDB URL: {MONGO_URL}")
    logger.info(f"🗄️  Database: {DB_NAME}")
    logger.info(f"🔑 OpenRouter API Keys: {'✅ ' + str(len(OPENROUTER_API_KEYS)) + ' keys configured' if OPENROUTER_API_KEYS else '❌ Missing'}")
    logger.info(f"🤖 Gemini API Keys: {'✅ ' + str(len(GEMINI_API_KEYS)) + ' keys configured' if GEMINI_API_KEYS else '❌ Missing'}")
    logger.info("✅ ChatPDF Backend ready!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("🛑 Shutting down ChatPDF Backend...")
    client.close()
    logger.info("✅ Database connection closed")

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
    model: str = "claude-3-opus-20240229"
    feature_type: str = "chat"

class CreateSessionRequest(BaseModel):
    title: str = "New Chat"

class GenerateQuestionsRequest(BaseModel):
    session_id: str
    question_type: str = "mixed"  # 'faq', 'mcq', 'true_false', 'mixed'
    chapter_segment: Optional[str] = None
    model: str = "claude-3-opus-20240229"

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

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# API Routes
@api_router.post("/sessions", response_model=ChatSession)
async def create_session(request: CreateSessionRequest):
    session = ChatSession(title=request.title)
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
    
    return {"ai_response": ai_message}

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
    models = []
    
    # Add OpenRouter models (Claude) if API keys are configured
    if OPENROUTER_API_KEYS:
        models.extend([
            {
                "id": "claude-3-opus-20240229",
                "name": "Claude 3 Opus",
                "provider": "OpenRouter",
                "free": False
            },
            {
                "id": "claude-3-sonnet-20240229",
                "name": "Claude 3 Sonnet",
                "provider": "OpenRouter",
                "free": False
            },
            {
                "id": "claude-3-haiku-20240307",
                "name": "Claude 3 Haiku",
                "provider": "OpenRouter",
                "free": False
            }
        ])
    
    # Add Gemini models if API keys are configured
    if GEMINI_API_KEYS:
        models.extend([
            {
                "id": "gemini-2.0-flash",
                "name": "Gemini 2.0 Flash",
                "provider": "Google",
                "free": True
            },
            {
                "id": "gemini-1.5-flash",
                "name": "Gemini 1.5 Flash",
                "provider": "Google",
                "free": True
            },
            {
                "id": "gemini-1.5-pro",
                "name": "Gemini 1.5 Pro",
                "provider": "Google",
                "free": True
            },
            {
                "id": "gemini-1.5-flash-8b",
                "name": "Gemini 1.5 Flash 8B",
                "provider": "Google",
                "free": True
            }
        ])
    
    return {"models": models}

@api_router.post("/generate-questions")
async def generate_questions(request: GenerateQuestionsRequest):
    # Verify session exists and has PDF
    session = await db.chat_sessions.find_one({"id": request.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.get("pdf_content"):
        raise HTTPException(status_code=400, detail="No PDF uploaded in this session")
    
    pdf_content = session["pdf_content"]
    
    # Handle chapter segmentation if specified
    if request.chapter_segment:
        # Simple chapter detection - could be enhanced
        content_lines = pdf_content.split('\n')
        chapter_content = []
        in_chapter = False
        
        for line in content_lines:
            if request.chapter_segment.lower() in line.lower():
                in_chapter = True
            elif any(keyword in line.lower() for keyword in ['chapter', 'section']) and in_chapter:
                break
            
            if in_chapter:
                chapter_content.append(line)
        
        pdf_content = '\n'.join(chapter_content)[:4000] if chapter_content else pdf_content[:4000]
    else:
        pdf_content = pdf_content[:4000]
    
    # Question generation prompts based on type
    question_prompts = {
        "faq": "Generate 8-10 frequently asked questions (FAQs) with detailed answers based on this document content.",
        "mcq": "Generate 10 multiple choice questions (A, B, C, D) with correct answers marked, based on this document content.",
        "true_false": "Generate 10 true/false questions with explanations for each answer, based on this document content.",
        "mixed": "Generate a mix of question types: 3 FAQs, 4 multiple choice questions, and 3 true/false questions based on this document content."
    }
    
    prompt = question_prompts.get(request.question_type, question_prompts["mixed"])
    
    ai_messages = [
        {
            "role": "system", 
            "content": "You are an AI assistant specialized in creating educational questions from document content. Generate clear, relevant questions that test comprehension and knowledge retention."
        },
        {
            "role": "user", 
            "content": f"""{prompt}

Document Content:
{pdf_content}

Format your response clearly with question numbers, and for MCQs include all options (A, B, C, D) with the correct answer marked."""
        }
    ]
    
    questions_result = await get_ai_response(ai_messages, request.model)
    
    # Save questions as message
    questions_message = ChatMessage(
        session_id=request.session_id,
        content=f"Generated Questions ({request.question_type}):\n{questions_result}",
        role="assistant",
        feature_type="question_generation"
    )
    await db.chat_messages.insert_one(questions_message.dict())
    
    return {
        "session_id": request.session_id,
        "question_type": request.question_type,
        "chapter_segment": request.chapter_segment,
        "questions": questions_result
    }

# Include the router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)