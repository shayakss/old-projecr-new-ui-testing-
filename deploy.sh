#!/bin/bash

# ChatPDF Deployment Helper Script
echo "🚀 ChatPDF Deployment Helper"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the ChatPDF root directory"
    exit 1
fi

# Function to build frontend for production
build_frontend() {
    echo "📦 Building frontend for production..."
    cd frontend || exit 1
    
    if [ -z "$REACT_APP_BACKEND_URL" ]; then
        echo "⚠️  Warning: REACT_APP_BACKEND_URL not set. Using default."
        echo "   Set it with: export REACT_APP_BACKEND_URL=https://your-backend-url.com"
    fi
    
    yarn install
    yarn build
    
    echo "✅ Frontend build complete! Files ready in frontend/build/"
    cd ..
}

# Function to prepare backend for deployment
prepare_backend() {
    echo "🛠️  Preparing backend for deployment..."
    
    # Check if all required files exist
    if [ ! -f "Procfile" ]; then
        echo "❌ Procfile not found. Creating one..."
        echo "web: cd backend && uvicorn server:app --host 0.0.0.0 --port \$PORT" > Procfile
    fi
    
    if [ ! -f "runtime.txt" ]; then
        echo "❌ runtime.txt not found. Creating one..."
        echo "python-3.11.0" > runtime.txt
    fi
    
    if [ ! -f "railway.json" ]; then
        echo "❌ railway.json not found. Creating one..."
        cat > railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn server:app --host 0.0.0.0 --port \$PORT",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
EOF
    fi
    
    echo "✅ Backend deployment files ready!"
}

# Function to check environment variables
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    missing_vars=()
    
    if [ -z "$MONGO_URL" ]; then
        missing_vars+=("MONGO_URL")
    fi
    
    if [ -z "$OPENROUTER_API_KEY" ] && [ -z "$GEMINI_API_KEY" ]; then
        missing_vars+=("OPENROUTER_API_KEY or GEMINI_API_KEY")
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo "⚠️  Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
        echo ""
        echo "📝 Set these variables in your deployment platform:"
        echo "   Railway: Project Settings > Variables"
        echo "   Heroku: heroku config:set VAR_NAME=value"
        echo "   Netlify: Site Settings > Environment Variables"
    else
        echo "✅ All required environment variables are set!"
    fi
}

# Function to show deployment URLs
show_deployment_info() {
    echo ""
    echo "🌐 Deployment Information"
    echo "========================"
    echo ""
    echo "📋 Deployment Checklist:"
    echo "  1. Deploy database: MongoDB Atlas (free tier)"
    echo "  2. Deploy backend: Railway/Heroku"  
    echo "  3. Deploy frontend: Netlify"
    echo ""
    echo "🔗 Helpful Links:"
    echo "  MongoDB Atlas: https://cloud.mongodb.com"
    echo "  Railway: https://railway.app"
    echo "  Netlify: https://netlify.com"
    echo ""
    echo "📖 Full guide: Check DEPLOYMENT.md for detailed instructions"
}

# Main menu
while true; do
    echo ""
    echo "Choose an option:"
    echo "1. Build frontend for production"
    echo "2. Prepare backend for deployment"
    echo "3. Check environment variables"
    echo "4. Show deployment information"
    echo "5. Do everything (prepare for deployment)"
    echo "6. Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            build_frontend
            ;;
        2)
            prepare_backend
            ;;
        3)
            check_env_vars
            ;;
        4)
            show_deployment_info
            ;;
        5)
            prepare_backend
            build_frontend
            check_env_vars
            show_deployment_info
            echo ""
            echo "🎉 Ready for deployment! Check DEPLOYMENT.md for next steps."
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-6."
            ;;
    esac
done