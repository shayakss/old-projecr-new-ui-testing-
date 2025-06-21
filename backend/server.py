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
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')

if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY environment variable is required")

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Create DeepSeek client
deepseek_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=DEEPSEEK_API_KEY,
)

# OpenRouter AI Functions
async def get_ai_response(messages: List[Dict], model: str = "meta-llama/llama-3.1-8b-instruct:free") -> str:
    try:
        response = await deepseek_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# Create the main app
app = FastAPI(title="Baloch AI chat PdF & GPT API", version="2.0.0")
api_router = APIRouter(prefix="/api")