@echo off
REM ChatPDF Local Setup Script for Windows
REM This script sets up MongoDB with initial data for the ChatPDF project

echo 🚀 Setting up ChatPDF MongoDB Database...

REM Check if MongoDB is running (basic check)
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe" >NUL
if "%ERRORLEVEL%"=="1" (
    echo ❌ MongoDB is not running. Please start MongoDB first.
    echo    Start MongoDB service from Services panel or run: net start MongoDB
    pause
    exit /b 1
)

REM Database configuration
set DB_NAME=chatpdf_database
set SCRIPT_DIR=%~dp0

echo 📊 Database: %DB_NAME%
echo 📁 Setup files directory: %SCRIPT_DIR%

REM Drop existing database (optional)
echo 🗑️  Dropping existing database (if exists)...
mongosh --eval "db.getSiblingDB('%DB_NAME%').dropDatabase()" --quiet

REM Create database and collections
echo 🏗️  Creating database and collections...
mongosh --eval "use %DB_NAME%; db.createCollection('chat_sessions'); db.createCollection('chat_messages'); db.createCollection('pdf_documents'); print('✅ Collections created successfully');" --quiet

REM Import sample data
echo 📤 Importing sample data...

if exist "%SCRIPT_DIR%chat_sessions.json" (
    echo   → Importing chat sessions...
    mongoimport --db "%DB_NAME%" --collection "chat_sessions" --file "%SCRIPT_DIR%chat_sessions.json" --jsonArray --quiet
    echo   ✅ Chat sessions imported
) else (
    echo   ⚠️  chat_sessions.json not found
)

if exist "%SCRIPT_DIR%chat_messages.json" (
    echo   → Importing chat messages...
    mongoimport --db "%DB_NAME%" --collection "chat_messages" --file "%SCRIPT_DIR%chat_messages.json" --jsonArray --quiet
    echo   ✅ Chat messages imported
) else (
    echo   ⚠️  chat_messages.json not found
)

if exist "%SCRIPT_DIR%pdf_documents.json" (
    echo   → Importing PDF documents...
    mongoimport --db "%DB_NAME%" --collection "pdf_documents" --file "%SCRIPT_DIR%pdf_documents.json" --jsonArray --quiet
    echo   ✅ PDF documents imported
) else (
    echo   ⚠️  pdf_documents.json not found
)

REM Create indexes
echo ⚡ Creating database indexes...
mongosh --eval "use %DB_NAME%; db.chat_sessions.createIndex({ 'id': 1 }, { unique: true }); db.chat_sessions.createIndex({ 'updated_at': -1 }); db.chat_messages.createIndex({ 'id': 1 }, { unique: true }); db.chat_messages.createIndex({ 'session_id': 1 }); db.chat_messages.createIndex({ 'timestamp': 1 }); db.pdf_documents.createIndex({ 'id': 1 }, { unique: true }); db.chat_messages.createIndex({ 'content': 'text' }); db.pdf_documents.createIndex({ 'content': 'text', 'filename': 'text' }); print('✅ Database indexes created successfully');" --quiet

REM Verify setup
echo 🔍 Verifying database setup...
mongosh --eval "use %DB_NAME%; print('📊 Database Statistics:'); print('  Chat Sessions: ' + db.chat_sessions.countDocuments()); print('  Chat Messages: ' + db.chat_messages.countDocuments()); print('  PDF Documents: ' + db.pdf_documents.countDocuments());" --quiet

echo.
echo 🎉 ChatPDF MongoDB setup completed successfully!
echo.
echo 📝 Next steps:
echo 1. Set up your backend environment variables in .env file:
echo    MONGO_URL=mongodb://localhost:27017
echo    DB_NAME=chatpdf_database
echo.
echo 2. Install backend dependencies:
echo    pip install -r requirements.txt
echo.
echo 3. Install frontend dependencies:
echo    cd frontend ^&^& npm install
echo.
echo 4. Start the application:
echo    Backend: uvicorn server:app --reload --host 0.0.0.0 --port 8001
echo    Frontend: npm start
echo.
echo 🌐 Access the application at: http://localhost:3000
echo.
pause