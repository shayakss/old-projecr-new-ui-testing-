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

# OpenRouter API configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Create the main app
app = FastAPI(title="Baloch AI chat PdF & GPT API", version="2.0.0")
api_router = APIRouter(prefix="/api")

# AI Functions
async def get_ai_response(messages: List[Dict], model: str = "claude-3-opus-20240229") -> str:
    try:
        # Convert chat format to OpenRouter format
        system_message = next((msg["content"] for msg in messages if msg["role"] == "system"), None)
        chat_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages if msg["role"] != "system"]
        
        # Use OpenRouter API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://github.com/baloch/chatpdf",
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
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

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
    logger.info(f"🔑 OpenRouter API Key: {'✅ Configured' if OPENROUTER_API_KEY else '❌ Missing'}")
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