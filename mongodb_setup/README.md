# ChatPDF MongoDB Setup Guide

This directory contains MongoDB setup files and scripts to get your ChatPDF project running locally.

## 📁 Files Included

- `chat_sessions.json` - Sample chat sessions data
- `chat_messages.json` - Sample chat messages and conversations
- `pdf_documents.json` - Sample PDF documents data
- `setup_mongodb.sh` - Setup script for Linux/macOS
- `setup_mongodb.bat` - Setup script for Windows
- `README.md` - This file

## 🚀 Quick Setup

### Prerequisites

1. **MongoDB installed and running**
   - **Ubuntu/Debian**: `sudo apt install mongodb-org`
   - **macOS**: `brew install mongodb/brew/mongodb-community`
   - **Windows**: Download from [MongoDB official site](https://www.mongodb.com/try/download/community)

2. **MongoDB tools installed** (for mongoimport)
   - Usually included with MongoDB installation
   - If not: `brew install mongodb/brew/mongodb-database-tools` (macOS)

### Automatic Setup

#### Linux/macOS:
```bash
chmod +x setup_mongodb.sh
./setup_mongodb.sh
```

#### Windows:
```cmd
setup_mongodb.bat
```

### Manual Setup

If you prefer to set up manually:

1. **Start MongoDB**
   ```bash
   # Linux/macOS
   sudo systemctl start mongod
   
   # macOS with brew
   brew services start mongodb/brew/mongodb-community
   
   # Windows
   net start MongoDB
   ```

2. **Create Database and Collections**
   ```bash
   mongosh
   use chatpdf_database
   db.createCollection('chat_sessions')
   db.createCollection('chat_messages')
   db.createCollection('pdf_documents')
   ```

3. **Import Sample Data**
   ```bash
   mongoimport --db chatpdf_database --collection chat_sessions --file chat_sessions.json --jsonArray
   mongoimport --db chatpdf_database --collection chat_messages --file chat_messages.json --jsonArray
   mongoimport --db chatpdf_database --collection pdf_documents --file pdf_documents.json --jsonArray
   ```

4. **Create Indexes for Performance**
   ```bash
   mongosh chatpdf_database
   db.chat_sessions.createIndex({ 'id': 1 }, { unique: true })
   db.chat_sessions.createIndex({ 'updated_at': -1 })
   db.chat_messages.createIndex({ 'id': 1 }, { unique: true })
   db.chat_messages.createIndex({ 'session_id': 1 })
   db.chat_messages.createIndex({ 'timestamp': 1 })
   db.pdf_documents.createIndex({ 'id': 1 }, { unique: true })
   db.chat_messages.createIndex({ 'content': 'text' })
   db.pdf_documents.createIndex({ 'content': 'text', 'filename': 'text' })
   ```

## 🗄️ Database Structure

### Collections

#### `chat_sessions`
- `id` (string) - Unique session identifier
- `title` (string) - Session title
- `created_at` (datetime) - Session creation time
- `updated_at` (datetime) - Last update time
- `pdf_filename` (string, optional) - Uploaded PDF filename
- `pdf_content` (string, optional) - Extracted PDF content

#### `chat_messages`
- `id` (string) - Unique message identifier
- `session_id` (string) - Reference to chat session
- `content` (string) - Message content
- `role` (string) - 'user' or 'assistant'
- `timestamp` (datetime) - Message timestamp
- `feature_type` (string) - Type of feature used (chat, qa_generation, etc.)

#### `pdf_documents`
- `id` (string) - Unique document identifier
- `filename` (string) - Original filename
- `content` (string) - Extracted text content
- `upload_date` (datetime) - Upload timestamp
- `file_size` (integer) - File size in bytes

## 🔧 Environment Configuration

After setting up MongoDB, configure your backend environment variables:

Create a `.env` file in your backend directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=chatpdf_database
JWT_SECRET=your-secret-key-change-in-production
```

## 🚦 Running the Application

1. **Backend** (from backend directory):
   ```bash
   pip install -r requirements.txt
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

2. **Frontend** (from frontend directory):
   ```bash
   npm install
   npm start
   ```

3. **Access**: Open http://localhost:3000 in your browser

## 🧪 Testing the Setup

You can verify the setup by checking:

1. **Database Status**:
   ```bash
   mongosh chatpdf_database
   db.chat_sessions.countDocuments()
   db.chat_messages.countDocuments()
   db.pdf_documents.countDocuments()
   ```

2. **Backend Health**:
   ```bash
   curl http://localhost:8001/api/health
   ```

3. **Frontend Access**: Visit http://localhost:3000

## 📊 Sample Data

The setup includes sample data to demonstrate the application:

- **3 sample chat sessions** with different scenarios
- **8 sample messages** showing various interactions
- **2 sample PDF documents** with content for testing

## 🔍 Troubleshooting

### Common Issues

1. **"MongoDB not running"**
   - Start MongoDB service: `sudo systemctl start mongod`
   - Check status: `sudo systemctl status mongod`

2. **"Connection refused"**
   - Ensure MongoDB is listening on port 27017
   - Check firewall settings

3. **"mongoimport not found"**
   - Install MongoDB tools: `brew install mongodb/brew/mongodb-database-tools`

4. **"Permission denied"**
   - Make script executable: `chmod +x setup_mongodb.sh`

### Verification Commands

```bash
# Check MongoDB status
sudo systemctl status mongod

# Test MongoDB connection
mongosh --eval "db.adminCommand('ismaster')"

# Check database contents
mongosh chatpdf_database --eval "db.getCollectionNames()"

# Test backend connection
python -c "import pymongo; print(pymongo.MongoClient('mongodb://localhost:27017').admin.command('ismaster'))"
```

## 📞 Support

If you encounter issues:
1. Check MongoDB logs: `sudo journalctl -u mongod`
2. Verify MongoDB is running: `ps aux | grep mongod`
3. Test connection: `mongosh --eval "db.adminCommand('ping')"`

## 🎯 Next Steps

After successful setup:
1. Explore the sample data in the application
2. Upload your own PDF documents
3. Test different AI features
4. Customize the application for your needs

Happy coding! 🚀