#!/bin/bash

# ChatPDF Local Setup Script
# This script sets up MongoDB with initial data for the ChatPDF project

echo "🚀 Setting up ChatPDF MongoDB Database..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   Ubuntu/Debian: sudo systemctl start mongod"
    echo "   macOS: brew services start mongodb/brew/mongodb-community"
    echo "   Windows: Start MongoDB service from Services panel"
    exit 1
fi

# Database configuration
DB_NAME="chatpdf_database"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📊 Database: $DB_NAME"
echo "📁 Setup files directory: $SCRIPT_DIR"

# Drop existing database (optional - comment out if you want to keep existing data)
echo "🗑️  Dropping existing database (if exists)..."
mongosh --eval "db.getSiblingDB('$DB_NAME').dropDatabase()" --quiet

# Create database and collections
echo "🏗️  Creating database and collections..."
mongosh --eval "
use $DB_NAME;
db.createCollection('chat_sessions');
db.createCollection('chat_messages');
db.createCollection('pdf_documents');
print('✅ Collections created successfully');
" --quiet

# Import sample data
echo "📤 Importing sample data..."

# Import chat sessions
if [ -f "$SCRIPT_DIR/chat_sessions.json" ]; then
    echo "  → Importing chat sessions..."
    mongoimport --db "$DB_NAME" --collection "chat_sessions" --file "$SCRIPT_DIR/chat_sessions.json" --jsonArray --quiet
    echo "  ✅ Chat sessions imported"
else
    echo "  ⚠️  chat_sessions.json not found"
fi

# Import chat messages
if [ -f "$SCRIPT_DIR/chat_messages.json" ]; then
    echo "  → Importing chat messages..."
    mongoimport --db "$DB_NAME" --collection "chat_messages" --file "$SCRIPT_DIR/chat_messages.json" --jsonArray --quiet
    echo "  ✅ Chat messages imported"
else
    echo "  ⚠️  chat_messages.json not found"
fi

# Import PDF documents
if [ -f "$SCRIPT_DIR/pdf_documents.json" ]; then
    echo "  → Importing PDF documents..."
    mongoimport --db "$DB_NAME" --collection "pdf_documents" --file "$SCRIPT_DIR/pdf_documents.json" --jsonArray --quiet
    echo "  ✅ PDF documents imported"
else
    echo "  ⚠️  pdf_documents.json not found"
fi

# Create indexes for better performance
echo "⚡ Creating database indexes..."
mongosh --eval "
use $DB_NAME;

// Indexes for chat_sessions
db.chat_sessions.createIndex({ 'id': 1 }, { unique: true });
db.chat_sessions.createIndex({ 'updated_at': -1 });
db.chat_sessions.createIndex({ 'created_at': -1 });

// Indexes for chat_messages
db.chat_messages.createIndex({ 'id': 1 }, { unique: true });
db.chat_messages.createIndex({ 'session_id': 1 });
db.chat_messages.createIndex({ 'timestamp': 1 });
db.chat_messages.createIndex({ 'feature_type': 1 });
db.chat_messages.createIndex({ 'session_id': 1, 'timestamp': 1 });

// Indexes for pdf_documents
db.pdf_documents.createIndex({ 'id': 1 }, { unique: true });
db.pdf_documents.createIndex({ 'filename': 1 });
db.pdf_documents.createIndex({ 'upload_date': -1 });

// Text search indexes
db.chat_messages.createIndex({ 'content': 'text' });
db.pdf_documents.createIndex({ 'content': 'text', 'filename': 'text' });

print('✅ Database indexes created successfully');
" --quiet

# Verify setup
echo "🔍 Verifying database setup..."
mongosh --eval "
use $DB_NAME;
print('📊 Database Statistics:');
print('  Chat Sessions: ' + db.chat_sessions.countDocuments());
print('  Chat Messages: ' + db.chat_messages.countDocuments());
print('  PDF Documents: ' + db.pdf_documents.countDocuments());
print('');
print('📋 Available Collections:');
db.getCollectionNames().forEach(function(collection) {
    print('  → ' + collection);
});
" --quiet

echo ""
echo "🎉 ChatPDF MongoDB setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your backend environment variables:"
echo "   MONGO_URL=mongodb://localhost:27017"
echo "   DB_NAME=chatpdf_database"
echo ""
echo "2. Install backend dependencies:"
echo "   pip install -r requirements.txt"
echo ""
echo "3. Install frontend dependencies:"
echo "   cd frontend && npm install"
echo ""
echo "4. Start the application:"
echo "   Backend: uvicorn server:app --reload --host 0.0.0.0 --port 8001"
echo "   Frontend: npm start"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo ""