# Railway Deployment Guide for ChatPDF Backend

## Prerequisites
- Railway account (sign up at railway.app)
- GitHub repository with your code
- API keys for OpenRouter and Gemini

## Step-by-Step Deployment Process

### 1. Prepare Your Repository
Your repository should now have these files:
- `railway.toml` - Railway configuration
- `requirements.txt` - Python dependencies
- `nixpacks.toml` - Build configuration
- `Procfile` - Process definition
- `backend/server.py` - Your FastAPI application

### 2. Deploy to Railway

#### Option A: Deploy from GitHub (Recommended)
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository
6. Railway will automatically detect it's a Python project

#### Option B: Deploy from Railway CLI
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

### 3. Add MongoDB Service
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "MongoDB"
3. Railway will automatically provision MongoDB and set MONGO_URL environment variable

### 4. Configure Environment Variables
In your Railway project dashboard, go to Variables tab and add:

**Required Variables:**
```
ENVIRONMENT=production
DB_NAME=chatpdf_database
JWT_SECRET=your-secret-key-change-in-production-chatpdf-2024

# OpenRouter API Keys (add all your keys)
OPENROUTER_API_KEY=sk-or-v1-your-first-key
OPENROUTER_API_KEY_2=sk-or-v1-your-second-key
OPENROUTER_API_KEY_3=sk-or-v1-your-third-key
OPENROUTER_API_KEY_4=sk-or-v1-your-fourth-key
OPENROUTER_API_KEY_5=sk-or-v1-your-fifth-key

# Gemini API Keys (add all your keys)
GEMINI_API_KEY=AIza-your-first-gemini-key
GEMINI_API_KEY_2=AIza-your-second-gemini-key
GEMINI_API_KEY_3=AIza-your-third-gemini-key
GEMINI_API_KEY_4=AIza-your-fourth-gemini-key
```

**Note:** MONGO_URL will be automatically set when you add MongoDB service.

### 5. Deploy and Test
1. Railway will automatically deploy after adding environment variables
2. Check the deployment logs in Railway dashboard
3. Test your API at: `https://your-project-name.up.railway.app/api/health`

### 6. Verify Deployment
Test these endpoints:
- Health check: `/api/health`
- Models: `/api/models`
- Create session: `/api/sessions` (POST)

## Important Notes

### CORS Configuration
The backend is configured to allow requests from:
- `*.railway.app` domains
- `*.up.railway.app` domains
- Your frontend URL (if FRONTEND_URL is set)

### Database Connection
- Railway's MongoDB service will automatically provide MONGO_URL
- No manual connection string configuration needed

### API Keys
- Your application supports multiple API keys for load balancing
- Add all your available keys for better performance
- Keys are automatically rotated for load distribution

### Health Checks
- Railway uses `/api/health` endpoint for health checks
- 300-second timeout configured
- Automatic restart on failure

## Troubleshooting

### Build Issues
- Check Railway build logs
- Ensure all dependencies in requirements.txt
- Verify emergentintegrations installs correctly

### Runtime Issues
- Check Runtime logs in Railway dashboard
- Verify environment variables are set
- Test MongoDB connection

### API Issues
- Verify API keys are valid
- Check CORS configuration if frontend can't connect
- Monitor error logs for specific issues

## Next Steps
After successful deployment:
1. Update your frontend REACT_APP_BACKEND_URL to point to Railway URL
2. Test all features thoroughly
3. Monitor performance and logs
4. Set up custom domain (optional)

## Support
- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway