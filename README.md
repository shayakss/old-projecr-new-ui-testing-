# ChatPDF - AI-Powered PDF Chat Application

## Overview
ChatPDF is a full-stack web application that allows users to upload PDF documents and have intelligent conversations with them using AI models. The application supports multiple AI providers and offers features like Q&A generation, research analysis, and document translation.

## Architecture
- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: MongoDB
- **AI Providers**: OpenRouter (Claude), Google (Gemini), Anthropic (Direct)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- MongoDB

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chatpdf

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
yarn install

# Start services
cd ..
sudo supervisorctl start all
```

## Configuration

### Environment Variables
The application uses environment variables for configuration:

#### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017/chatpdf
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway Errors
**Symptoms**: Frontend shows 502 errors when accessing `/api/models`, `/api/sessions`, etc.

**Causes & Solutions**:

**Missing Dependencies**:
```bash
# Check backend logs
tail -50 /var/log/supervisor/backend.err.log

# Common missing dependencies
cd /app/backend
pip install multidict attrs yarl aiohappyeyeballs aiosignal
pip install httpcore jiter regex markupsafe
pip install aiohttp openai tiktoken tokenizers jinja2 pillow

# Update requirements.txt
echo "multidict" >> requirements.txt
echo "attrs" >> requirements.txt
echo "yarl" >> requirements.txt

# Restart backend
sudo supervisorctl restart backend
```

**Backend Not Starting**:
```bash
# Check service status
sudo supervisorctl status

# Restart all services
sudo supervisorctl restart all

# Check if backend is responding
curl http://localhost:8001/api/health
```

#### 2. Database Connection Issues
**Symptoms**: MongoDB connection errors

**Solutions**:
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb

# Verify connection
mongo --eval "db.runCommand('ping')"
```

#### 3. API Key Issues
**Symptoms**: 401 authentication errors, AI features not working

**Solutions**:
```bash
# Check API keys are set
cd /app/backend
grep -E "(OPENROUTER|GEMINI|ANTHROPIC)" .env

# Test API keys
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openrouter.ai/api/v1/models
```

#### 4. Frontend Connection Issues
**Symptoms**: CORS errors, network errors

**Solutions**:
```bash
# Check frontend environment
cd /app/frontend
cat .env

# Verify backend URL is correct
curl http://localhost:8001/api/health

# Restart frontend
sudo supervisorctl restart frontend
```

### Debugging Steps

1. **Check Service Status**:
```bash
sudo supervisorctl status
```

2. **Check Logs**:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/backend.out.log

# Frontend logs
tail -f /var/log/supervisor/frontend.err.log
```

3. **Test API Endpoints**:
```bash
# Health check
curl http://localhost:8001/api/health

# Models endpoint
curl http://localhost:8001/api/models

# Sessions endpoint
curl http://localhost:8001/api/sessions
```

4. **Check Dependencies**:
```bash
# Backend dependencies
cd /app/backend
pip list | grep -E "(fastapi|uvicorn|motor|pymongo|openai|anthropic)"

# Frontend dependencies
cd /app/frontend
yarn list | grep -E "(react|axios)"
```

### Performance Optimization

1. **Database Optimization**:
```bash
# Create indexes for better performance
mongo chatpdf --eval "db.sessions.createIndex({user_id: 1, created_at: -1})"
```

2. **Memory Management**:
```bash
# Monitor memory usage
free -h
ps aux | grep -E "(python|node)" | head -10
```

## API Documentation

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/models` - List available AI models
- `GET /api/sessions` - List chat sessions
- `POST /api/sessions` - Create new session
- `POST /api/sessions/{id}/upload` - Upload PDF
- `POST /api/sessions/{id}/chat` - Send message
- `POST /api/sessions/{id}/generate-qa` - Generate Q&A
- `POST /api/research` - Research analysis

## Development

### Running in Development Mode
```bash
# Backend
cd /app/backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend
cd /app/frontend
yarn start
```

### Testing
```bash
# Backend tests
cd /app
python backend_test.py

# Frontend tests
cd /app/frontend
yarn test
```

## Support

For issues not covered in this troubleshooting guide:

1. Check the logs for specific error messages
2. Verify all dependencies are installed
3. Ensure API keys are valid and have sufficient credits
4. Test individual components (database, backend, frontend) separately

## Version History
- v1.0: Initial release with basic chat functionality
- v1.1: Added Q&A generation and research features
- v1.2: Added multi-provider AI support
- v1.3: Enhanced UI and troubleshooting improvements
