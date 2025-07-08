# ChatPDF - Complete Local Setup Package

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or Atlas)
- OpenRouter API Key (required)
- Gemini API Key (optional)

### Installation Steps

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install emergentintegrations first
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Install all dependencies
pip install -r requirements.txt

# Copy .env.template to .env and add your API keys
cp .env.template .env
# Edit .env with your API keys

# Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
yarn install

# Copy .env.template to .env (should work as-is)
cp .env.template .env

# Start frontend
yarn start
```

#### 3. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/docs

### Features
✅ AI-powered PDF chat with multiple models
✅ Session management
✅ PDF upload and text extraction
✅ Q&A generation
✅ Research and summarization
✅ Translation features
✅ Export functionality
✅ System health monitoring

### API Keys Needed
1. **OpenRouter API Key**: Get from https://openrouter.ai/
2. **Gemini API Key** (optional): Get from https://ai.google.dev/

### Troubleshooting
- Make sure MongoDB is running
- Check that all dependencies are installed
- Verify API keys are valid
- Check firewall settings for ports 3000 and 8001

### Support
If you encounter issues:
1. Check the error logs
2. Verify all dependencies are installed
3. Ensure API keys are correct
4. Test endpoints individually