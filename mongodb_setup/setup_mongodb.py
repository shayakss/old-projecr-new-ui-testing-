#!/usr/bin/env python3
"""
ChatPDF MongoDB Setup Script (Python version)
This script sets up MongoDB with initial data for the ChatPDF project
"""

import pymongo
import json
import os
import sys
from datetime import datetime
from pathlib import Path

def setup_mongodb():
    """Set up MongoDB database with sample data"""
    
    # Configuration
    MONGO_URL = "mongodb://localhost:27017"
    DB_NAME = "chatpdf_database"
    
    print("🚀 Setting up ChatPDF MongoDB Database...")
    
    # Test MongoDB connection
    try:
        client = pymongo.MongoClient(MONGO_URL)
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("Please ensure MongoDB is running on localhost:27017")
        return False
    
    # Get database and collections
    db = client[DB_NAME]
    
    # Get script directory
    script_dir = Path(__file__).parent
    
    print(f"📊 Database: {DB_NAME}")
    print(f"📁 Setup files directory: {script_dir}")
    
    # Drop existing database (optional)
    print("🗑️  Dropping existing database (if exists)...")
    client.drop_database(DB_NAME)
    
    # Create collections
    print("🏗️  Creating collections...")
    collections = ['chat_sessions', 'chat_messages', 'pdf_documents']
    for collection_name in collections:
        db.create_collection(collection_name)
    print("✅ Collections created successfully")
    
    # Import sample data
    print("📤 Importing sample data...")
    
    # Load and import each JSON file
    data_files = [
        ('chat_sessions.json', 'chat_sessions'),
        ('chat_messages.json', 'chat_messages'),
        ('pdf_documents.json', 'pdf_documents')
    ]
    
    for file_name, collection_name in data_files:
        file_path = script_dir / file_name
        
        if file_path.exists():
            print(f"  → Importing {collection_name}...")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Convert date strings to datetime objects
                for item in data:
                    for key, value in item.items():
                        if isinstance(value, dict) and '$date' in value:
                            item[key] = datetime.fromisoformat(value['$date'].replace('Z', '+00:00'))
                
                # Insert data
                if data:
                    result = db[collection_name].insert_many(data)
                    print(f"  ✅ {collection_name} imported ({len(result.inserted_ids)} documents)")
                else:
                    print(f"  ⚠️  {file_name} is empty")
                    
            except Exception as e:
                print(f"  ❌ Error importing {file_name}: {e}")
        else:
            print(f"  ⚠️  {file_name} not found")
    
    # Create indexes for better performance
    print("⚡ Creating database indexes...")
    
    try:
        # Indexes for chat_sessions
        db.chat_sessions.create_index([('id', 1)], unique=True)
        db.chat_sessions.create_index([('updated_at', -1)])
        db.chat_sessions.create_index([('created_at', -1)])
        
        # Indexes for chat_messages
        db.chat_messages.create_index([('id', 1)], unique=True)
        db.chat_messages.create_index([('session_id', 1)])
        db.chat_messages.create_index([('timestamp', 1)])
        db.chat_messages.create_index([('feature_type', 1)])
        db.chat_messages.create_index([('session_id', 1), ('timestamp', 1)])
        
        # Indexes for pdf_documents
        db.pdf_documents.create_index([('id', 1)], unique=True)
        db.pdf_documents.create_index([('filename', 1)])
        db.pdf_documents.create_index([('upload_date', -1)])
        
        # Text search indexes
        db.chat_messages.create_index([('content', 'text')])
        db.pdf_documents.create_index([('content', 'text'), ('filename', 'text')])
        
        print("✅ Database indexes created successfully")
        
    except Exception as e:
        print(f"⚠️  Warning: Some indexes may not have been created: {e}")
    
    # Verify setup
    print("🔍 Verifying database setup...")
    
    try:
        stats = {
            'Chat Sessions': db.chat_sessions.count_documents({}),
            'Chat Messages': db.chat_messages.count_documents({}),
            'PDF Documents': db.pdf_documents.count_documents({})
        }
        
        print("📊 Database Statistics:")
        for name, count in stats.items():
            print(f"  {name}: {count}")
        
        print("\n📋 Available Collections:")
        for collection in db.list_collection_names():
            print(f"  → {collection}")
            
    except Exception as e:
        print(f"⚠️  Error verifying setup: {e}")
    
    print("\n🎉 ChatPDF MongoDB setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Set up your backend environment variables:")
    print("   MONGO_URL=mongodb://localhost:27017")
    print("   DB_NAME=chatpdf_database")
    print("\n2. Install backend dependencies:")
    print("   pip install -r requirements.txt")
    print("\n3. Install frontend dependencies:")
    print("   cd frontend && npm install")
    print("\n4. Start the application:")
    print("   Backend: uvicorn server:app --reload --host 0.0.0.0 --port 8001")
    print("   Frontend: npm start")
    print("\n🌐 Access the application at: http://localhost:3000")
    
    return True

if __name__ == "__main__":
    success = setup_mongodb()
    sys.exit(0 if success else 1)