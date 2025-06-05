from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
import io
import PyPDF2
import openai
from openai import AsyncOpenAI
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenRouter configuration
OPENROUTER_API_KEY = os.environ['OPENROUTER_API_KEY']
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="ChatPDF API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    content: str
    role: str  # 'user' or 'assistant'
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    pdf_context: Optional[str] = None

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    pdf_filename: Optional[str] = None
    pdf_content: Optional[str] = None

class PDFDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    content: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_size: int

class SendMessageRequest(BaseModel):
    session_id: str
    content: str
    model: str = "meta-llama/llama-3.1-8b-instruct:free"

class CreateSessionRequest(BaseModel):
    title: str = "New Chat"

# Authentication Functions
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

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
            max_tokens=1500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# API Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email}
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"]}
    }

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}

@api_router.post("/sessions", response_model=ChatSession)
async def create_session(request: CreateSessionRequest, current_user: User = Depends(get_current_user)):
    session = ChatSession(
        user_id=current_user.id,
        title=request.title
    )
    await db.chat_sessions.insert_one(session.dict())
    return session

@api_router.get("/sessions", response_model=List[ChatSession])
async def get_sessions(current_user: User = Depends(get_current_user)):
    sessions = await db.chat_sessions.find({"user_id": current_user.id}).sort("updated_at", -1).to_list(100)
    return [ChatSession(**session) for session in sessions]

@api_router.post("/sessions/{session_id}/upload-pdf")
async def upload_pdf(
    session_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Verify session belongs to user
    session = await db.chat_sessions.find_one({"id": session_id, "user_id": current_user.id})
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
        user_id=current_user.id,
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
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user)
):
    # Verify session belongs to user
    session = await db.chat_sessions.find_one({"id": session_id, "user_id": current_user.id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message
    user_message = ChatMessage(
        session_id=session_id,
        user_id=current_user.id,
        content=request.content,
        role="user"
    )
    await db.chat_messages.insert_one(user_message.dict())
    
    # Get chat history
    messages_cursor = db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1)
    chat_history = await messages_cursor.to_list(100)
    
    # Prepare messages for AI
    ai_messages = []
    
    # Add system message with PDF context if available
    if session.get("pdf_content"):
        system_message = f"""You are an AI assistant specialized in analyzing PDF documents. 
        
PDF Content:
{session["pdf_content"][:3000]}...

Please answer questions based on this PDF content. If a question is not related to the PDF, politely redirect the user to ask questions about the document."""
        ai_messages.append({"role": "system", "content": system_message})
    else:
        ai_messages.append({"role": "system", "content": "You are a helpful AI assistant. Please assist the user with their questions."})
    
    # Add conversation history
    for msg in chat_history[-10:]:  # Last 10 messages for context
        ai_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    # Get AI response
    ai_response = await get_ai_response(ai_messages, request.model)
    
    # Save AI message
    ai_message = ChatMessage(
        session_id=session_id,
        user_id=current_user.id,
        content=ai_response,
        role="assistant",
        pdf_context=session.get("pdf_filename")
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

@api_router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_messages(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify session belongs to user
    session = await db.chat_sessions.find_one({"id": session_id, "user_id": current_user.id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(1000)
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
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify session belongs to user
    session = await db.chat_sessions.find_one({"id": session_id, "user_id": current_user.id})
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
