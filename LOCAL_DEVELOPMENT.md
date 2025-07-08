# ChatPDF Local Development Guide

This guide helps you set up and run the ChatPDF project locally on your machine.

## 🛠️ Prerequisites

### 1. MongoDB
- **Ubuntu/Debian**: `sudo apt install mongodb-org`
- **macOS**: `brew install mongodb/brew/mongodb-community`
- **Windows**: Download from [MongoDB official site](https://www.mongodb.com/try/download/community)

### 2. Python 3.11+
- **Ubuntu/Debian**: `sudo apt install python3 python3-pip`
- **macOS**: `brew install python3`
- **Windows**: Download from [Python official site](https://www.python.org/downloads/)

### 3. Node.js 18+
- **Ubuntu/Debian**: `sudo apt install nodejs npm`
- **macOS**: `brew install node`
- **Windows**: Download from [Node.js official site](https://nodejs.org/)

## 🚀 Quick Start

### 1. Clone/Download the Project
```bash
# If you have git access
git clone <repository-url>
cd chatpdf-project

# Or download and extract the ZIP file
```

### 2. Set Up MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb/brew/mongodb-community  # macOS
net start MongoDB  # Windows

# Navigate to MongoDB setup directory
cd mongodb_setup

# Run the setup script
./setup_mongodb.sh    # Linux/macOS
setup_mongodb.bat     # Windows
# OR
python setup_mongodb.py  # Any platform
```

### 3. Configure Environment Variables

Create `.env` file in the `backend` directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=chatpdf_database
JWT_SECRET=your-secret-key-change-in-production

# Add your API keys (optional for basic testing)
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set Up Backend
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 5. Set Up Frontend
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the frontend development server
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 🔧 Configuration

### Backend Configuration (.env)
```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=chatpdf_database

# Security
JWT_SECRET=your-secret-key-change-in-production

# AI API Keys (get from respective providers)
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIzaSy...

# Optional: Multiple keys for load balancing
OPENROUTER_API_KEY_2=sk-or-v1-...
GEMINI_API_KEY_2=AIzaSy...
```

### Frontend Configuration (.env)
```env
# Backend URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Development settings
WDS_SOCKET_PORT=3000
```

## 📁 Project Structure

```
chatpdf-project/
├── backend/
│   ├── server.py          # FastAPI server
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   └── App.css       # Styling
│   ├── package.json      # Node.js dependencies
│   └── .env              # Frontend environment
├── mongodb_setup/
│   ├── setup_mongodb.sh  # MongoDB setup script
│   ├── *.json           # Sample data files
│   └── README.md        # MongoDB setup guide
└── README.md            # This file
```

## 🧪 Testing the Setup

### 1. Test MongoDB Connection
```bash
# Using MongoDB shell
mongosh chatpdf_database
db.chat_sessions.countDocuments()

# Using Python
python -c "import pymongo; print(pymongo.MongoClient('mongodb://localhost:27017').admin.command('ping'))"
```

### 2. Test Backend
```bash
# Health check
curl http://localhost:8001/api/health

# Get available models
curl http://localhost:8001/api/models

# Get sessions
curl http://localhost:8001/api/sessions
```

### 3. Test Frontend
- Open http://localhost:3000
- Check for any console errors
- Try creating a new chat session

## 🔍 Troubleshooting

### MongoDB Issues

**"Connection refused"**
```bash
# Check if MongoDB is running
sudo systemctl status mongod
ps aux | grep mongod

# Start MongoDB
sudo systemctl start mongod
```

**"mongoimport not found"**
```bash
# Install MongoDB tools
brew install mongodb/brew/mongodb-database-tools  # macOS
sudo apt install mongodb-database-tools           # Ubuntu
```

### Backend Issues

**"Module not found"**
```bash
# Install missing dependencies
pip install -r requirements.txt

# Check Python version
python --version
```

**"Port already in use"**
```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>
```

### Frontend Issues

**"npm command not found"**
```bash
# Install Node.js
# Ubuntu: sudo apt install nodejs npm
# macOS: brew install node
# Windows: Download from nodejs.org
```

**"Port 3000 already in use"**
```bash
# Use different port
PORT=3001 npm start
```

## 🎯 Features Overview

### Core Features
- **PDF Upload & Processing**: Upload PDF files and extract text
- **AI Chat**: Interactive conversations with your documents
- **Multiple AI Models**: Choose from Claude, Gemini, and other models
- **Question Generation**: Auto-generate FAQ, MCQ, and True/False questions
- **Translation**: Translate documents to multiple languages
- **Advanced Search**: Search across all documents and conversations
- **Export**: Export conversations in TXT, PDF, or DOCX formats

### AI Providers
- **OpenRouter**: Access to Claude models (Opus, Sonnet, Haiku)
- **Google Gemini**: Direct integration with Gemini models
- **Load Balancing**: Multiple API keys for better performance

## 📊 Database Schema

### Collections
- `chat_sessions`: User chat sessions with PDFs
- `chat_messages`: Individual messages and AI responses
- `pdf_documents`: Uploaded PDF files and extracted content

### Sample Data
The setup includes sample data to demonstrate features:
- 3 sample chat sessions
- 8 sample messages showing various interactions
- 2 sample PDF documents

## 🔑 Getting API Keys

### OpenRouter
1. Visit https://openrouter.ai/
2. Create an account
3. Go to Keys section
4. Generate a new API key
5. Add to your .env file

### Google Gemini
1. Visit https://ai.google.dev/
2. Create/use Google account
3. Go to API Keys section
4. Generate a new API key
5. Add to your .env file

## 🚀 Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Use MongoDB Atlas or secure self-hosted MongoDB
3. **Security**: Implement proper authentication and authorization
4. **SSL**: Use HTTPS for all communications
5. **Load Balancing**: Configure load balancers for high availability
6. **Monitoring**: Implement logging and monitoring systems

## 💡 Development Tips

1. **Code Changes**: Backend has auto-reload enabled, frontend has hot-reload
2. **Database**: Use MongoDB Compass for visual database management
3. **API Testing**: Use the built-in FastAPI docs at http://localhost:8001/docs
4. **Debugging**: Check browser console and terminal outputs for errors
5. **Performance**: Monitor API response times and optimize as needed

## 📞 Support

If you encounter issues:
1. Check the logs in your terminal
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Test API endpoints individually
5. Check environment variables

## 🎉 Happy Coding!

You're now ready to develop and extend the ChatPDF application. Explore the codebase, experiment with features, and build amazing AI-powered document interactions!