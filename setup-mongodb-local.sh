#!/bin/bash

# MongoDB Local Setup for ChatPDF Backend
# Supports multiple operating systems

echo "🗄️  MongoDB Local Setup for ChatPDF"
echo "=================================="
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        OS="debian"
    elif [ -f /etc/redhat-release ]; then
        OS="redhat"
    else
        OS="linux"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "🔍 Detected OS: $OS"
echo ""

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is already installed!"
    MONGODB_VERSION=$(mongod --version | head -n1)
    echo "   Version: $MONGODB_VERSION"
    echo ""
else
    echo "📦 MongoDB not found. Installing..."
    echo ""
    
    case $OS in
        "debian")
            echo "🐧 Installing MongoDB on Debian/Ubuntu..."
            
            # Install MongoDB
            sudo apt-get update
            sudo apt-get install -y wget curl gnupg
            
            # Add MongoDB GPG key and repository
            curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
            
            # Detect architecture
            ARCH=$(dpkg --print-architecture)
            echo "deb [ arch=$ARCH signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
            
            sudo apt-get update
            sudo apt-get install -y mongodb-org
            ;;
            
        "macos")
            echo "🍎 Installing MongoDB on macOS..."
            if command -v brew &> /dev/null; then
                brew tap mongodb/brew
                brew install mongodb-community
            else
                echo "❌ Homebrew not found. Please install Homebrew first:"
                echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            ;;
            
        "redhat")
            echo "🔴 Installing MongoDB on RedHat/CentOS/Fedora..."
            sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo > /dev/null <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/\$basearch/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
            sudo yum install -y mongodb-org
            ;;
            
        "windows")
            echo "🪟 For Windows, please download MongoDB from:"
            echo "   https://www.mongodb.com/try/download/community"
            echo "   Or use: winget install MongoDB.Server"
            exit 1
            ;;
            
        *)
            echo "❓ Unsupported OS. Please install MongoDB manually:"
            echo "   https://docs.mongodb.com/manual/installation/"
            exit 1
            ;;
    esac
fi

echo ""
echo "🚀 Starting MongoDB service..."

case $OS in
    "debian"|"redhat"|"linux")
        # Enable and start MongoDB service
        sudo systemctl enable mongod 2>/dev/null || echo "Service enable may not be available in containers"
        sudo systemctl start mongod 2>/dev/null || echo "Systemctl may not be available in containers"
        
        # Alternative: Start mongod directly if systemctl not available
        if ! systemctl is-active --quiet mongod 2>/dev/null; then
            echo "🔄 Starting MongoDB directly..."
            sudo mkdir -p /var/lib/mongodb
            sudo mkdir -p /var/log/mongodb
            sudo chown -R mongodb:mongodb /var/lib/mongodb 2>/dev/null || echo "Setting ownership..."
            sudo chown -R mongodb:mongodb /var/log/mongodb 2>/dev/null || echo "Setting log ownership..."
            
            # Start MongoDB in background
            sudo -u mongodb mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork --bind_ip_all 2>/dev/null || \
            mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork --bind_ip_all 2>/dev/null || \
            echo "⚠️  May need to start MongoDB manually"
        fi
        ;;
        
    "macos")
        brew services start mongodb-community
        ;;
esac

echo ""
echo "🔍 Checking MongoDB status..."

# Wait a moment for MongoDB to start
sleep 3

# Test MongoDB connection
if command -v mongosh &> /dev/null; then
    MONGO_CLIENT="mongosh"
elif command -v mongo &> /dev/null; then
    MONGO_CLIENT="mongo"
else
    echo "⚠️  MongoDB client not found, but server may be running"
    MONGO_CLIENT=""
fi

if [ ! -z "$MONGO_CLIENT" ]; then
    echo "Testing connection with $MONGO_CLIENT..."
    if echo 'db.runCommand("ping").ok' | $MONGO_CLIENT --quiet 2>/dev/null; then
        echo "✅ MongoDB is running and accessible!"
    else
        echo "⚠️  MongoDB may be starting... Please wait a moment and test again."
    fi
else
    # Alternative test using netstat or ss
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep :27017 &> /dev/null; then
            echo "✅ MongoDB is listening on port 27017!"
        else
            echo "❌ MongoDB is not listening on port 27017"
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln | grep :27017 &> /dev/null; then
            echo "✅ MongoDB is listening on port 27017!"
        else
            echo "❌ MongoDB is not listening on port 27017"
        fi
    fi
fi

echo ""
echo "📋 MongoDB Local Setup Summary:"
echo "================================"
echo "🔗 Connection URL: mongodb://localhost:27017"
echo "📊 Database Name: chatpdf_database"
echo "🖥️  Admin Interface: MongoDB Compass (optional)"
echo ""

echo "🔧 Useful MongoDB Commands:"
echo "# Check status"
case $OS in
    "debian"|"redhat"|"linux")
        echo "sudo systemctl status mongod"
        echo "# Stop MongoDB"
        echo "sudo systemctl stop mongod"
        echo "# Restart MongoDB"
        echo "sudo systemctl restart mongod"
        ;;
    "macos")
        echo "brew services list | grep mongodb"
        echo "# Stop MongoDB"
        echo "brew services stop mongodb-community"
        echo "# Restart MongoDB"
        echo "brew services restart mongodb-community"
        ;;
esac

echo ""
echo "📱 Connect to MongoDB:"
if [ ! -z "$MONGO_CLIENT" ]; then
    echo "$MONGO_CLIENT"
    echo "$MONGO_CLIENT mongodb://localhost:27017/chatpdf_database"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Verify MongoDB is running"
echo "2. Test ChatPDF backend: cd /app && python -m backend.server"
echo "3. Check health endpoint: curl http://localhost:8001/api/health"
echo ""

echo "✅ MongoDB local setup complete!"