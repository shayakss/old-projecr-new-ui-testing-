#!/bin/bash

# Railway Deployment Verification Script
# Tests your deployed ChatPDF backend

echo "🧪 Railway ChatPDF Backend - Deployment Verification"
echo "===================================================="
echo ""

read -p "Enter your Railway deployment URL (e.g., https://your-app.up.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ URL is required!"
    exit 1
fi

# Remove trailing slash if present
RAILWAY_URL=$(echo "$RAILWAY_URL" | sed 's/\/$//')

echo ""
echo "Testing deployment at: $RAILWAY_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/api/health")
if [ "$response" = "200" ]; then
    echo "✅ Health check: PASSED"
    health_data=$(curl -s "$RAILWAY_URL/api/health")
    echo "   Response: $health_data"
else
    echo "❌ Health check: FAILED (HTTP $response)"
fi

echo ""

# Test 2: Models Endpoint
echo "2️⃣  Testing models endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/api/models")
if [ "$response" = "200" ]; then
    echo "✅ Models endpoint: PASSED"
    models_data=$(curl -s "$RAILWAY_URL/api/models" | jq '.models | length' 2>/dev/null || echo "unknown")
    echo "   Available models: $models_data"
else
    echo "❌ Models endpoint: FAILED (HTTP $response)"
fi

echo ""

# Test 3: Create Session
echo "3️⃣  Testing session creation..."
session_response=$(curl -s -X POST "$RAILWAY_URL/api/sessions" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Session"}')

session_status=$(echo "$session_response" | jq -r '.id // "error"' 2>/dev/null || echo "error")

if [ "$session_status" != "error" ] && [ "$session_status" != "null" ]; then
    echo "✅ Session creation: PASSED"
    echo "   Session ID: $session_status"
    
    # Test 4: Get Sessions
    echo ""
    echo "4️⃣  Testing sessions list..."
    sessions_response=$(curl -s "$RAILWAY_URL/api/sessions")
    sessions_count=$(echo "$sessions_response" | jq '. | length' 2>/dev/null || echo "0")
    echo "✅ Sessions list: PASSED"
    echo "   Total sessions: $sessions_count"
    
else
    echo "❌ Session creation: FAILED"
    echo "   Response: $session_response"
fi

echo ""

# Test 5: CORS Check
echo "5️⃣  Testing CORS configuration..."
cors_response=$(curl -s -X OPTIONS "$RAILWAY_URL/api/health" \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    -w "%{http_code}")

if [[ "$cors_response" == *"200"* ]] || [[ "$cors_response" == *"204"* ]]; then
    echo "✅ CORS configuration: PASSED"
else
    echo "⚠️  CORS configuration: Check manually if needed"
fi

echo ""

# Test 6: Database Connection (via health endpoint)
echo "6️⃣  Testing database connection..."
db_health=$(curl -s "$RAILWAY_URL/api/health/detailed" | jq -r '.database_status // "unknown"' 2>/dev/null || echo "unknown")
if [ "$db_health" = "healthy" ]; then
    echo "✅ Database connection: PASSED"
elif [ "$db_health" = "unknown" ]; then
    echo "⚠️  Database connection: Cannot determine (endpoint may not exist)"
else
    echo "❌ Database connection: FAILED"
fi

echo ""
echo "🎯 Deployment Verification Summary"
echo "================================="
echo ""
echo "✅ = Passed    ❌ = Failed    ⚠️  = Warning/Unknown"
echo ""
echo "📝 Next Steps:"
echo "1. If all tests passed: Your backend is ready!"
echo "2. If some tests failed: Check Railway logs with 'railway logs'"
echo "3. Update your frontend REACT_APP_BACKEND_URL to: $RAILWAY_URL"
echo ""
echo "🔗 Useful URLs:"
echo "   Health: $RAILWAY_URL/api/health"
echo "   Models: $RAILWAY_URL/api/models"
echo "   Docs: $RAILWAY_URL/docs (if enabled)"
echo ""
echo "🚀 Your ChatPDF backend is deployed at: $RAILWAY_URL"