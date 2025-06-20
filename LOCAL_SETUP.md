# ChatPDF - Local Development Setup

## Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)
- OpenRouter API Key

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file:**
   ```bash
   # Create backend/.env file with:
   MONGO_URL="mongodb://localhost:27017"  # Or your MongoDB connection string
   DB_NAME="chatpdf_database"
   OPENROUTER_API_KEY="your-openrouter-api-key-here"
   ```

5. **Start MongoDB:**
   - Install MongoDB locally OR use MongoDB Atlas (cloud)
   - Make sure MongoDB is running on localhost:27017

6. **Start backend server:**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install  # or npm install
   ```

3. **Create .env file:**
   ```bash
   # Create frontend/.env file with:
   REACT_APP_BACKEND_URL="http://localhost:8001"
   ```

4. **Start frontend:**
   ```bash
   yarn start  # or npm start
   ```

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/docs

## Features Available

✅ **Session Management** - Create, view, delete chat sessions
✅ **PDF Upload** - Upload and extract text from PDF files  
✅ **AI Chat** - Ask questions about uploaded PDFs
✅ **Multiple AI Models** - Choose from 4 free OpenRouter models
✅ **Advanced Features:**
  - Auto Q&A Generation (15 questions from PDF)
  - Research & Summarization
  - General AI Assistant

## Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify OpenRouter API key is valid
- Check Python dependencies are installed

**Frontend can't connect:**
- Verify backend is running on port 8001
- Check REACT_APP_BACKEND_URL in frontend/.env
- Ensure CORS is enabled (already configured)

**AI features not working:**
- Verify OpenRouter API key is valid
- Check internet connection
- Try different AI models from the dropdown