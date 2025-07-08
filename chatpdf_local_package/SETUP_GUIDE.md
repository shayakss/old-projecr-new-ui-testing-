# 🚀 ChatPDF - Complete Local Setup Guide

Welcome to ChatPDF! This guide will help you set up the AI-powered PDF chat application on your local machine.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

### Required Software
- **Python 3.8 or higher** - [Download Python](https://python.org/downloads/)
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

### API Keys (Required for AI Features)
- **OpenRouter API Key** - Get from [OpenRouter](https://openrouter.ai/)
- **Gemini API Key** (optional) - Get from [Google AI Studio](https://ai.google.dev/)

## 🔧 Quick Setup (Automated)

### Option 1: Use Setup Script
```bash
# Make the setup script executable (macOS/Linux)
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install emergentintegrations (special package)
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Install all dependencies
pip install -r requirements.txt
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Yarn (if not already installed)
npm install -g yarn

# Install dependencies
yarn install
```

## ⚙️ Configuration

### 1. Backend Configuration
Copy the environment template and add your API keys:

```bash
cd backend
cp .env.template .env
```

Edit `backend/.env` with your API keys:
```bash
# Database Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="chatpdf_database"

# OpenRouter API Keys (Add your keys here)
OPENROUTER_API_KEY="your-openrouter-api-key-here"

# Gemini API Keys (Optional)
GEMINI_API_KEY="your-gemini-api-key-here"

# JWT Secret
JWT_SECRET="your-secret-key-change-in-production-chatpdf-2024"
```

### 2. Frontend Configuration
The frontend should work with default settings, but you can verify:

```bash
cd frontend
cp .env.template .env
```

The `.env` file should contain:
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows: Start MongoDB service from Services panel
   # macOS: brew services start mongodb/brew/mongodb-community
   # Linux: sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster
3. Get your connection string
4. Update `MONGO_URL` in `backend/.env` with your Atlas connection string

## 🚀 Running the Application

### Start the Backend
```bash
# Terminal 1
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start the backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Start the Frontend
```bash
# Terminal 2
cd frontend

# Start the frontend
yarn start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 🧪 Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:8001/api/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### 2. Models Endpoint
```bash
curl http://localhost:8001/api/models
# Should return list of available AI models
```

### 3. Frontend Test
1. Open http://localhost:3000
2. You should see the ChatPDF home page
3. Click "Get Started" to access the chat interface
4. Try uploading a PDF and asking questions

## 🎯 Features Overview

### Core Features
- **AI Chat**: Converse with your PDF documents
- **Multiple AI Models**: Claude 3 (Opus, Sonnet, Haiku) and Gemini models
- **Question Generation**: Auto-generate FAQs, MCQs, and True/False questions
- **Session Management**: Save and organize your chat sessions
- **Voice Input**: Use speech recognition for hands-free interaction

### Advanced Features
- **Real-time Chat**: Instant responses from AI models
- **Markdown Support**: Rich text formatting in responses
- **File Upload**: Drag and drop PDF upload
- **Responsive Design**: Works on desktop and mobile devices

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if MongoDB is running
# Check if all dependencies are installed
pip list | grep -E "(fastapi|uvicorn|motor|pymongo)"

# Check for missing packages
pip install -r requirements.txt
```

#### Frontend Can't Connect
```bash
# Verify backend is running
curl http://localhost:8001/api/health

# Check frontend environment
cat frontend/.env

# Restart frontend
cd frontend
yarn start
```

#### AI Features Not Working
- Verify your OpenRouter API key is valid
- Check internet connection
- Try different AI models from the dropdown
- Check backend logs for API errors

#### MongoDB Connection Issues
```bash
# Check MongoDB status
# Local: Make sure MongoDB service is running
# Atlas: Verify connection string and network access

# Test connection
python -c "from motor.motor_asyncio import AsyncIOMotorClient; client = AsyncIOMotorClient('mongodb://localhost:27017'); print('Connected!')"
```

### Debug Mode
For additional debugging, you can run the backend with more verbose logging:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload --log-level debug
```

## 📚 API Documentation

Once the backend is running, you can access the interactive API documentation at:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🛠️ Development

### Backend Development
- The backend uses FastAPI with automatic reload
- MongoDB with Motor for async database operations
- Multiple AI provider support (OpenRouter + Gemini)

### Frontend Development  
- React with modern hooks
- Tailwind CSS for styling
- Axios for API communication
- React Markdown for rich text rendering

### Project Structure
```
chatpdf-local/
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   └── index.js      # React entry point
│   ├── package.json      # Node.js dependencies
│   └── .env             # Frontend configuration
└── README.md            # This file
```

## 🤝 Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Verify all dependencies are installed correctly
3. Ensure API keys are valid and have sufficient credits
4. Check that MongoDB is running and accessible
5. Review the backend logs for error messages

## 🎉 Success!

If everything is working correctly, you should be able to:
- Upload PDF documents
- Ask questions about the content
- Generate questions automatically
- Switch between different AI models
- Save and manage chat sessions

Happy chatting with your PDFs! 🚀📄