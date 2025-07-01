#!/bin/bash

# PM2 Development Management Script
# This script helps manage PM2 processes for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Installing PM2..."
        npm install -g pm2
    else
        print_status "PM2 is installed"
    fi
}

# Function to create log directories
create_log_dirs() {
    print_status "Creating log directories..."
    sudo mkdir -p /var/log/pm2
    sudo chmod 755 /var/log/pm2
}

# Function to start all services
start_services() {
    print_status "Starting ChatPDF services with PM2..."
    
    # Stop any existing processes
    pm2 delete all 2>/dev/null || true
    
    # Start services with development configuration
    pm2 start /app/ecosystem.config.js --env development
    
    print_status "Services started! Use 'pm2 status' to check status"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all PM2 services..."
    pm2 stop all
    pm2 delete all
    print_status "All services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting ChatPDF services..."
    pm2 restart all
    print_status "Services restarted"
}

# Function to show logs
show_logs() {
    case $1 in
        backend)
            print_status "Showing backend logs (press Ctrl+C to exit)..."
            pm2 logs chatpdf-backend
            ;;
        frontend)
            print_status "Showing frontend logs (press Ctrl+C to exit)..."
            pm2 logs chatpdf-frontend
            ;;
        mongodb)
            print_status "Showing MongoDB logs (press Ctrl+C to exit)..."
            pm2 logs chatpdf-mongodb
            ;;
        all|*)
            print_status "Showing all logs (press Ctrl+C to exit)..."
            pm2 logs
            ;;
    esac
}

# Function to show status
show_status() {
    print_status "PM2 Process Status:"
    pm2 status
    echo ""
    print_status "System Status:"
    pm2 monit
}

# Function to monitor services
monitor_services() {
    print_status "Opening PM2 monitor (press 'q' to exit)..."
    pm2 monit
}

# Function to setup PM2 startup
setup_startup() {
    print_status "Setting up PM2 startup script..."
    pm2 startup
    print_warning "Please run the command shown above to enable PM2 startup"
}

# Function to save PM2 configuration
save_config() {
    print_status "Saving current PM2 configuration..."
    pm2 save
    print_status "Configuration saved"
}

# Function to reload services
reload_services() {
    print_status "Reloading services gracefully..."
    pm2 reload all
    print_status "Services reloaded"
}

# Function to show help
show_help() {
    echo "ChatPDF PM2 Development Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  reload          Gracefully reload all services"
    echo "  status          Show service status"
    echo "  logs [service]  Show logs (backend/frontend/mongodb/all)"
    echo "  monitor         Open PM2 monitor"
    echo "  setup           Setup PM2 startup script"
    echo "  save            Save current PM2 configuration"
    echo "  health          Show health check"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start all services"
    echo "  $0 logs backend         # Show backend logs"
    echo "  $0 status               # Show service status"
}

# Function to perform health check
health_check() {
    print_status "Performing health check..."
    
    # Check PM2 processes
    echo "PM2 Process Status:"
    pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status)"'
    
    echo ""
    
    # Check backend health endpoint
    print_info "Checking backend health..."
    if curl -s http://localhost:8001/api/health > /dev/null; then
        print_status "✅ Backend is healthy"
    else
        print_error "❌ Backend health check failed"
    fi
    
    # Check frontend
    print_info "Checking frontend..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "✅ Frontend is healthy"
    else
        print_error "❌ Frontend health check failed"
    fi
    
    # Check MongoDB
    print_info "Checking MongoDB..."
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status "✅ MongoDB is healthy"
    else
        print_error "❌ MongoDB health check failed"
    fi
}

# Main script logic
case $1 in
    start)
        check_pm2
        create_log_dirs
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    reload)
        reload_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    monitor)
        monitor_services
        ;;
    setup)
        setup_startup
        ;;
    save)
        save_config
        ;;
    health)
        health_check
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