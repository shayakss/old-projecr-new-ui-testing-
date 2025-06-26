# 🚀 ChatPDF Deployment Guide

## Architecture Overview
This full-stack application requires 3 separate deployments:
- **Frontend (React)**: Netlify
- **Backend (FastAPI)**: Railway or Heroku  
- **Database**: MongoDB Atlas

## 📋 Prerequisites
- GitHub account
- Netlify account
- Railway account (or Heroku)
- MongoDB Atlas account

## 🗄️ Step 1: Deploy Database (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Sign up for free account
   - Create new project

2. **Create Database Cluster**
   - Click "Build a Database"
   - Choose "M0 Cluster" (Free tier)
   - Select region closest to your users
   - Name your cluster (e.g., "chatpdf-cluster")

3. **Setup Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username/password (save these!)
   - Grant "Read and write to any database" role

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
   - Or add specific IPs for better security

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/chatpdf?retryWrites=true&w=majority
   ```

## 🖥️ Step 2: Deploy Backend (Railway)

### Option A: Railway (Recommended)

1. **Setup Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project"
   - Choose "Deploy from GitHub repo"

2. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these environment variables:
   ```bash
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/chatpdf
   OPENROUTER_API_KEY=your_openrouter_key
   GEMINI_API_KEY=your_gemini_key
   ANTHROPIC_API_KEY=your_anthropic_key
   PORT=8000
   ```

3. **Configure Build Settings**
   - Railway should auto-detect Python
   - If not, add these files to your repo root:
   ```bash
   # railway.json (already created)
   # Procfile (already created)  
   # runtime.txt (already created)
   ```

4. **Deploy**
   - Push code to GitHub
   - Railway will automatically deploy
   - Get your backend URL (e.g., `https://your-app.railway.app`)

### Option B: Heroku

1. **Install Heroku CLI**
   ```bash
   # Install Heroku CLI
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-chatpdf-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/chatpdf"
   heroku config:set OPENROUTER_API_KEY="your_key"
   heroku config:set GEMINI_API_KEY="your_key"  
   heroku config:set ANTHROPIC_API_KEY="your_key"
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## 🌐 Step 3: Deploy Frontend (Netlify)

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   # If not already done
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/chatpdf.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Choose your ChatPDF repository
   - Configure build settings:
     ```
     Base directory: frontend
     Build command: yarn build
     Publish directory: frontend/build
     ```

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings
   - Click "Environment variables"
   - Add:
   ```bash
   REACT_APP_BACKEND_URL=https://your-backend.railway.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically
   - Get your frontend URL (e.g., `https://chatpdf-app.netlify.app`)

### Method 2: Manual Deployment

1. **Build Frontend Locally**
   ```bash
   cd frontend
   yarn install
   REACT_APP_BACKEND_URL=https://your-backend.railway.app yarn build
   ```

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Drag and drop the `frontend/build` folder
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=frontend/build
   ```

## 🔒 Step 4: Configure CORS (Backend)

Update your backend CORS settings to allow your Netlify domain:

```python
# In backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.netlify.app",  # Add your Netlify URL
        "http://localhost:3000"  # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Step 5: Test Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend.railway.app/api/health
   curl https://your-backend.railway.app/api/models
   ```

2. **Test Frontend**
   - Visit your Netlify URL
   - Try creating a session
   - Upload a PDF
   - Send a message

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add your Netlify domain to backend CORS settings
   - Redeploy backend

2. **Build Failures**
   - Check build logs in Railway/Netlify dashboard
   - Ensure all dependencies are in requirements.txt/package.json

3. **Environment Variables**
   - Double-check all API keys are set correctly
   - Ensure MongoDB connection string is correct

4. **API Connection Issues**
   - Verify REACT_APP_BACKEND_URL points to correct backend
   - Check backend is responding at /api/health

## 💰 Cost Estimation

### Free Tier Limits
- **Netlify**: 100GB bandwidth, 300 build minutes/month
- **Railway**: $5 credit/month (covers small apps)
- **MongoDB Atlas**: 512MB storage, shared cluster

### Scaling Up
- **Netlify Pro**: $19/month (more bandwidth, forms)
- **Railway**: Pay per usage after free credit
- **MongoDB Atlas**: $9/month for dedicated cluster

## 🚀 Going Live Checklist

- [ ] Database deployed on MongoDB Atlas
- [ ] Backend deployed on Railway/Heroku  
- [ ] Frontend deployed on Netlify
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] API keys working
- [ ] Custom domain configured (optional)
- [ ] SSL certificates enabled
- [ ] Analytics setup (optional)

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test each service individually
4. Check network connectivity between services

Your ChatPDF app will be live at:
- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://your-backend.railway.app`
- **Database**: MongoDB Atlas (internal)