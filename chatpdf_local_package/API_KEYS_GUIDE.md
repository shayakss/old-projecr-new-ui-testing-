# 🔑 API Keys Setup Guide

This guide will help you obtain and configure the required API keys for ChatPDF.

## 🤖 OpenRouter API Key (Required)

OpenRouter provides access to multiple AI models including Claude 3 models.

### How to Get OpenRouter API Key:

1. **Visit OpenRouter**: Go to [https://openrouter.ai/](https://openrouter.ai/)

2. **Sign Up**: Create a free account using your email or GitHub

3. **Get API Key**: 
   - Go to your dashboard
   - Click on "API Keys" in the sidebar
   - Click "Create API Key"
   - Copy your API key (starts with `sk-or-v1-...`)

4. **Add Credits** (Optional):
   - OpenRouter provides some free credits to start
   - You can add more credits if needed for heavy usage
   - Claude models are very affordable (around $0.001-0.01 per 1K tokens)

### Supported Models:
- Claude 3 Opus (Most capable)
- Claude 3 Sonnet (Balanced)
- Claude 3 Haiku (Fastest)

## 🧠 Google Gemini API Key (Optional)

Gemini provides additional free AI models as backup options.

### How to Get Gemini API Key:

1. **Visit Google AI Studio**: Go to [https://ai.google.dev/](https://ai.google.dev/)

2. **Sign In**: Use your Google account to sign in

3. **Get API Key**:
   - Click "Get API key" button
   - Create a new API key
   - Copy your API key (starts with `AIza...`)

4. **Free Usage**: 
   - Gemini offers generous free tier
   - Perfect for testing and light usage

### Supported Models:
- Gemini 2.0 Flash (Latest)
- Gemini 1.5 Flash (Fast)
- Gemini 1.5 Pro (Advanced)
- Gemini 1.5 Flash 8B (Efficient)

## ⚙️ Configuration

### Backend Environment File
After getting your API keys, update your `backend/.env` file:

```bash
# Database Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="chatpdf_database"

# OpenRouter API Key (Required)
OPENROUTER_API_KEY="sk-or-v1-your-actual-api-key-here"

# Multiple OpenRouter Keys (Optional - for load balancing)
OPENROUTER_API_KEY_2="sk-or-v1-your-second-key-here"
OPENROUTER_API_KEY_3="sk-or-v1-your-third-key-here"

# Gemini API Keys (Optional)
GEMINI_API_KEY="AIzaSy-your-actual-gemini-key-here"
GEMINI_API_KEY_2="AIzaSy-your-second-gemini-key-here"

# JWT Secret
JWT_SECRET="your-secret-key-change-in-production-chatpdf-2024"
```

### API Key Features

#### Load Balancing
- You can add multiple API keys for the same provider
- The system will automatically rotate between keys
- This helps with rate limiting and increased throughput

#### Fallback System
- If OpenRouter fails, system tries Gemini as backup
- If Gemini fails, system tries OpenRouter as backup
- Ensures maximum uptime and reliability

## 💰 Cost Estimates

### OpenRouter (Claude Models)
- **Claude 3 Haiku**: ~$0.25 per million input tokens, ~$1.25 per million output tokens
- **Claude 3 Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens  
- **Claude 3 Opus**: ~$15 per million input tokens, ~$75 per million output tokens

**Real Usage**: A typical PDF chat session (10-20 exchanges) costs around $0.01-0.05

### Google Gemini
- **Free Tier**: 15 requests per minute, 1,500 requests per day
- **Paid**: Very competitive pricing, often cheaper than Claude

## 🔐 Security Best Practices

### API Key Security
1. **Never commit API keys to version control**
2. **Use environment variables** (as shown in this setup)
3. **Regenerate keys if compromised**
4. **Monitor usage** for unexpected spikes

### Environment File Security
```bash
# Make sure .env is in your .gitignore
echo ".env" >> .gitignore

# Set proper permissions (Unix/Linux/macOS)
chmod 600 backend/.env
```

## 🧪 Testing Your API Keys

### Test OpenRouter Key
```bash
curl -H "Authorization: Bearer YOUR_OPENROUTER_KEY" \
     -H "Content-Type: application/json" \
     https://openrouter.ai/api/v1/models
```

### Test Gemini Key
```bash
curl -H "x-goog-api-key: YOUR_GEMINI_KEY" \
     https://generativelanguage.googleapis.com/v1/models
```

### Using the Application
1. Start your ChatPDF application
2. Upload a PDF
3. Ask a question
4. Check if you get proper AI responses

## ❓ FAQ

### Q: Do I need both API keys?
**A**: OpenRouter is required for Claude models. Gemini is optional but recommended as backup.

### Q: How much will this cost me?
**A**: For normal usage (few PDFs, moderate chatting), expect $1-5 per month with OpenRouter. Gemini free tier might cover your needs entirely.

### Q: Can I use other AI providers?
**A**: Currently supports OpenRouter and Gemini. The system is designed to be extensible for other providers.

### Q: What if my API key stops working?
**A**: Check your account credits, rate limits, and key validity. The app will show error messages to help diagnose issues.

### Q: Is my data sent to these AI providers?
**A**: Yes, your PDF content and questions are sent to process AI responses. Both providers have privacy policies regarding data handling.

## 🔄 Key Rotation

For production use, consider rotating your API keys periodically:

1. Generate new API keys
2. Update your `.env` file
3. Restart the backend service
4. Verify everything works
5. Revoke old keys

## 📞 Support

If you need help with API keys:

- **OpenRouter**: Check their documentation at [https://openrouter.ai/docs](https://openrouter.ai/docs)
- **Gemini**: Visit [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **ChatPDF Issues**: Check the main troubleshooting guide

Happy chatting! 🚀