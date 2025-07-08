#!/bin/bash

# Quick MongoDB Setup Fix for Railway

echo "🔧 MongoDB Connection Fix for Railway"
echo "====================================="
echo ""

echo "❌ Error: connect ECONNREFUSED 127.0.0.1:27017"
echo "🔍 Cause: MongoDB service not configured on Railway"
echo ""

echo "🚀 SOLUTION: Add MongoDB Service to Railway"
echo ""

echo "📱 Method 1: Railway Dashboard (Recommended)"
echo "1. Go to your Railway project: https://railway.app/dashboard"
echo "2. Click 'New Service'"
echo "3. Select 'Database' → 'MongoDB'"
echo "4. Railway will automatically:"
echo "   ✅ Create MongoDB instance"
echo "   ✅ Set MONGO_URL environment variable"
echo "   ✅ Connect to your backend service"
echo ""

echo "⚡ Method 2: Railway CLI"
echo "railway add mongodb"
echo ""

echo "🔍 Check if MongoDB service was added:"
echo "railway services list"
echo ""

echo "📋 Verify environment variables:"
echo "railway variables"
echo ""

echo "📊 Check deployment logs:"
echo "railway logs"
echo ""

echo "⚠️  IMPORTANT NOTES:"
echo "- MONGO_URL will be automatically set by Railway"
echo "- Don't manually set MONGO_URL if using Railway MongoDB"
echo "- Railway MongoDB is isolated and secure"
echo "- Your local .env MONGO_URL won't be used on Railway"
echo ""

echo "🎯 After adding MongoDB service:"
echo "1. Railway will redeploy your app automatically"
echo "2. Check logs with: railway logs"
echo "3. Test with: ./verify-deployment.sh"
echo ""

echo "💡 Alternative: External MongoDB (MongoDB Atlas)"
echo "If you prefer external MongoDB:"
echo "1. Create MongoDB Atlas cluster"
echo "2. Get connection string"
echo "3. Set MONGO_URL in Railway variables"
echo ""

read -p "Press Enter to continue..."

echo ""
echo "🔗 Useful Links:"
echo "Railway Dashboard: https://railway.app/dashboard"
echo "Railway Docs: https://docs.railway.app/databases/mongodb"
echo ""

echo "✅ After MongoDB service is added, your ChatPDF backend will work perfectly!"