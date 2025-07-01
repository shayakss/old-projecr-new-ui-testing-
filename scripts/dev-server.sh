#!/bin/bash

# ChatPDF Development Server Management Script
# This script provides utilities for managing the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/app"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
LOG_DIR="/var/log"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Function to check dependencies
check_dependencies() {
    print_header "Checking Dependencies..."
    
    # Check Python
    if command -v python3 &> /dev/null; then
        print_status "✅ Python3: $(python3 --version)"
    else
        print_error "❌ Python3 not found"
        return 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        print_status "✅ Node.js: $(node --version)"
    else
        print_error "❌ Node.js not found"
        return 1
    fi
    
    # Check Yarn
    if command -v yarn &> /dev/null; then
        print_status "✅ Yarn: $(yarn --version)"
    else
        print_error "❌ Yarn not found"
        return 1
    fi
    
    # Check MongoDB
    if command -v mongod &> /dev/null; then
        print_status "✅ MongoDB: $(mongod --version | head -1)"
    else
        print_error "❌ MongoDB not found"
        return 1
    fi
    
    # Check supervisor
    if command -v supervisorctl &> /dev/null; then
        print_status "✅ Supervisor available"
    else
        print_warning "⚠️ Supervisor not found"
    fi
}

# Function to install backend dependencies
install_backend_deps() {
    print_header "Installing Backend Dependencies..."
    cd "$BACKEND_DIR"
    
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python packages..."
        pip install -r requirements.txt
        print_status "✅ Backend dependencies installed"
    else
        print_error "❌ requirements.txt not found"
        return 1
    fi
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_header "Installing Frontend Dependencies..."
    cd "$FRONTEND_DIR"
    
    if [ -f "package.json" ]; then
        print_status "Installing Node.js packages..."
        yarn install
        print_status "✅ Frontend dependencies installed"
    else
        print_error "❌ package.json not found"
        return 1
    fi
}

# Function to start development servers
start_dev_servers() {
    print_header "Starting Development Servers..."
    
    # Create log directories
    sudo mkdir -p /var/log/supervisor /var/log/pm2
    sudo chmod 755 /var/log/supervisor /var/log/pm2
    
    # Start with supervisor
    print_status "Starting services with supervisor..."
    sudo supervisorctl restart all
    
    # Wait for services to start
    sleep 5
    
    # Check status
    print_status "Service Status:"
    sudo supervisorctl status
}

# Function to stop all servers
stop_servers() {
    print_header "Stopping All Servers..."
    
    # Stop supervisor services
    if command -v supervisorctl &> /dev/null; then
        print_status "Stopping supervisor services..."
        sudo supervisorctl stop all
    fi
    
    # Stop PM2 if running
    if command -v pm2 &> /dev/null; then
        print_status "Stopping PM2 processes..."
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
    fi
    
    print_status "✅ All servers stopped"
}

# Function to check server health
check_health() {
    print_header "Checking Server Health..."
    
    # Check backend health
    print_info "Checking backend (http://localhost:8001)..."
    if curl -s http://localhost:8001/api/health > /dev/null; then
        print_status "✅ Backend is healthy"
        curl -s http://localhost:8001/api/health | jq '.' 2>/dev/null || echo "Backend response received"
    else
        print_error "❌ Backend health check failed"
    fi
    
    echo ""
    
    # Check frontend
    print_info "Checking frontend (http://localhost:3000)..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "✅ Frontend is healthy"
    else
        print_error "❌ Frontend health check failed"
    fi
    
    echo ""
    
    # Check MongoDB
    print_info "Checking MongoDB..."
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status "✅ MongoDB is healthy"
    else
        print_error "❌ MongoDB health check failed"
    fi
}

# Function to show logs
show_logs() {
    local service="$1"
    
    case "$service" in
        backend)
            print_status "Showing backend logs..."
            tail -f /var/log/supervisor/backend.*.log 2>/dev/null || \
            tail -f /var/log/chatpdf-backend.log 2>/dev/null || \
            echo "No backend logs found"
            ;;
        frontend)
            print_status "Showing frontend logs..."
            tail -f /var/log/supervisor/frontend.*.log 2>/dev/null || \
            echo "No frontend logs found"
            ;;
        mongodb)
            print_status "Showing MongoDB logs..."
            tail -f /var/log/supervisor/mongodb.*.log 2>/dev/null || \
            tail -f /var/log/mongodb/mongod.log 2>/dev/null || \
            echo "No MongoDB logs found"
            ;;
        all)
            print_status "Showing all logs..."
            tail -f /var/log/supervisor/*.log 2>/dev/null || \
            echo "No supervisor logs found"
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available services: backend, frontend, mongodb, all"
            return 1
            ;;
    esac
}

# Function to restart specific service
restart_service() {
    local service="$1"
    
    print_header "Restarting Service: $service"
    
    case "$service" in
        backend)
            sudo supervisorctl restart backend
            ;;
        frontend)
            sudo supervisorctl restart frontend
            ;;
        mongodb)
            sudo supervisorctl restart mongodb
            ;;
        all)
            sudo supervisorctl restart all
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available services: backend, frontend, mongodb, all"
            return 1
            ;;
    esac
    
    print_status "✅ Service $service restarted"
}

# Function to clean and rebuild
clean_rebuild() {
    print_header "Clean and Rebuild..."
    
    # Stop all services
    stop_servers
    
    # Clean frontend
    print_status "Cleaning frontend..."
    cd "$FRONTEND_DIR"
    rm -rf node_modules build
    
    # Clean backend cache
    print_status "Cleaning backend cache..."
    cd "$BACKEND_DIR"
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    # Reinstall dependencies
    install_backend_deps
    install_frontend_deps
    
    # Restart services
    start_dev_servers
    
    print_status "✅ Clean rebuild completed"
}

# Function to show environment info
show_env_info() {
    print_header "Environment Information"
    
    echo "Project Structure:"
    tree -L 2 "$PROJECT_ROOT" 2>/dev/null || ls -la "$PROJECT_ROOT"
    
    echo ""
    echo "Backend Environment Variables:"
    if [ -f "$BACKEND_DIR/.env" ]; then
        grep -v "API_KEY" "$BACKEND_DIR/.env" | head -10
    else
        echo "No backend .env file found"
    fi
    
    echo ""
    echo "Frontend Environment Variables:"
    if [ -f "$FRONTEND_DIR/.env" ]; then
        cat "$FRONTEND_DIR/.env"
    else
        echo "No frontend .env file found"
    fi
    
    echo ""
    echo "System Information:"
    echo "OS: $(uname -a)"
    echo "CPU: $(nproc) cores"
    echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
    echo "Disk: $(df -h / | tail -1 | awk '{print $4}') available"
}

# Function to setup development environment
setup_dev_env() {
    print_header "Setting Up Development Environment..."
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_backend_deps
    install_frontend_deps
    
    # Create log directories
    sudo mkdir -p /var/log/supervisor /var/log/pm2
    sudo chmod 755 /var/log/supervisor /var/log/pm2
    
    # Create symbolic links for easy access
    ln -sf "$PROJECT_ROOT/scripts/dev-server.sh" /usr/local/bin/chatpdf-dev 2>/dev/null || true
    
    print_status "✅ Development environment setup complete"
}

# Function to show help
show_help() {
    echo "ChatPDF Development Server Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup               Setup development environment"
    echo "  start               Start all development servers"
    echo "  stop                Stop all servers"
    echo "  restart [service]   Restart specific service or all"
    echo "  health              Check server health"
    echo "  logs [service]      Show logs (backend/frontend/mongodb/all)"
    echo "  deps                Check dependencies"
    echo "  install             Install all dependencies"
    echo "  clean               Clean and rebuild everything"
    echo "  env                 Show environment information"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all servers"
    echo "  $0 restart backend         # Restart only backend"
    echo "  $0 logs frontend           # Show frontend logs"
    echo "  $0 health                  # Check all services"
}

# Main script logic
case "${1:-help}" in
    setup)
        setup_dev_env
        ;;
    start)
        start_dev_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        restart_service "${2:-all}"
        ;;
    health)
        check_health
        ;;
    logs)
        show_logs "${2:-all}"
        ;;
    deps)
        check_dependencies
        ;;
    install)
        install_backend_deps
        install_frontend_deps
        ;;
    clean)
        clean_rebuild
        ;;
    env)
        show_env_info
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac