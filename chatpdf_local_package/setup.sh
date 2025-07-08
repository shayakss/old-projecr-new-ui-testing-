#!/bin/bash

echo "🚀 ChatPDF Local Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    print_warning "Yarn is not installed. Installing yarn globally..."
    npm install -g yarn
fi

print_info "Starting ChatPDF local setup..."

# Setup Backend
print_info "Setting up backend..."
cd backend

# Create virtual environment
print_info "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # macOS/Linux
    source venv/bin/activate
fi

# Install emergentintegrations first
print_info "Installing emergentintegrations..."
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Install other dependencies
print_info "Installing Python dependencies..."
pip install -r requirements.txt

print_status "Backend setup completed!"

# Setup Frontend
print_info "Setting up frontend..."
cd ../frontend

# Install dependencies
print_info "Installing Node.js dependencies..."
yarn install

print_status "Frontend setup completed!"

# Back to root directory
cd ..

print_status "Setup completed successfully!"
print_info ""
print_info "📝 Next Steps:"
print_info "1. Set up your API keys in backend/.env (copy from .env.template)"
print_info "2. Start MongoDB (locally or use Atlas)"
print_info "3. Run the application:"
print_info ""
print_info "   Backend (Terminal 1):"
print_info "   cd backend"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    print_info "   venv\\Scripts\\activate"
else
    print_info "   source venv/bin/activate"
fi
print_info "   uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
print_info ""
print_info "   Frontend (Terminal 2):"
print_info "   cd frontend"
print_info "   yarn start"
print_info ""
print_info "   Then open http://localhost:3000 in your browser"
print_info ""
print_status "Happy chatting with your PDFs! 🎉"