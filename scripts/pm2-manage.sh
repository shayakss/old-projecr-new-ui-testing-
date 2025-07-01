#!/bin/bash

# PM2 Management Script for ChatPDF Application
# This script provides easy commands to manage your ChatPDF app with PM2

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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   ChatPDF PM2 Management       ${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Please install it first with: npm install -g pm2"
        exit 1
    fi
}

# Function to start all services
start_all() {
    print_status "Starting ChatPDF services with PM2 (Backend + Frontend only)..."
    
    # Stop supervisor backend and frontend services to avoid port conflicts
    print_status "Stopping supervisor backend and frontend services to avoid conflicts..."
    sudo supervisorctl stop backend frontend || true
    
    # Start PM2 ecosystem
    pm2 start /app/ecosystem.final.config.js --env development
    
    print_status "Services started successfully!"
    pm2 status
}

# Function to start production
start_production() {
    print_status "Starting ChatPDF in production mode..."
    
    # Stop supervisor backend and frontend services
    sudo supervisorctl stop backend frontend || true
    
    # Start PM2 ecosystem in production mode
    pm2 start /app/ecosystem.final.config.js --env production
    
    print_status "Production services started successfully!"
    pm2 status
}

# Function to stop all services
stop_all() {
    print_status "Stopping all PM2 services..."
    pm2 stop all
    pm2 delete all
    
    print_status "Restarting supervisor backend and frontend services..."
    sudo supervisorctl start backend frontend
    
    print_status "Switched back to supervisor management"
}

# Function to restart all services
restart_all() {
    print_status "Restarting all ChatPDF services..."
    pm2 restart all
    pm2 status
}

# Function to show status
show_status() {
    print_status "Current PM2 status:"
    pm2 status
    echo ""
    print_status "Detailed process information:"
    pm2 show chatpdf-backend
    pm2 show chatpdf-frontend
    pm2 show chatpdf-mongodb
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        pm2 logs --timestamp
    else
        print_status "Showing logs for $1..."
        pm2 logs $1 --timestamp
    fi
}

# Function to monitor services
monitor() {
    print_status "Opening PM2 monitoring dashboard..."
    pm2 monit
}

# Function to setup PM2 startup
setup_startup() {
    print_status "Setting up PM2 to start on system boot..."
    pm2 startup
    print_warning "After running the command above, run: pm2 save"
}

# Function to save current PM2 configuration
save_config() {
    print_status "Saving current PM2 configuration..."
    pm2 save
    print_status "Configuration saved!"
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start              Start all services in development mode"
    echo "  start-prod         Start all services in production mode"
    echo "  stop               Stop all PM2 services and switch back to supervisor"
    echo "  restart            Restart all services"
    echo "  status             Show current status of all services"
    echo "  logs [service]     Show logs (optionally for specific service)"
    echo "  monitor            Open PM2 monitoring dashboard"
    echo "  setup-startup      Setup PM2 to start on system boot"
    echo "  save               Save current PM2 configuration"
    echo "  web-dashboard      Start PM2 web dashboard"
    echo "  cluster-info       Show clustering information"
    echo "  help               Show this help message"
    echo ""
    echo "Service names:"
    echo "  - chatpdf-backend"
    echo "  - chatpdf-frontend" 
    echo "  - chatpdf-mongodb"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs chatpdf-backend"
    echo "  $0 restart"
    echo ""
}

# Function to start web dashboard
web_dashboard() {
    print_status "PM2 web dashboard is not available in this version."
    print_status "Use the following alternatives for monitoring:"
    echo ""
    print_status "1. Terminal monitoring: pm2 monit"
    print_status "2. Process details: pm2 show chatpdf-backend"
    print_status "3. Real-time logs: pm2 logs --timestamp"
    print_status "4. Status overview: pm2 status"
    echo ""
    print_status "Starting terminal monitoring..."
    pm2 monit
}

# Function to show cluster information
cluster_info() {
    print_status "Cluster information for ChatPDF Backend:"
    pm2 show chatpdf-backend
    echo ""
    print_status "CPU and Memory usage:"
    pm2 monit --no-daemon | head -20
}

# Main script logic
check_pm2

case "${1:-help}" in
    start)
        start_all
        ;;
    start-prod)
        start_production
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    monitor)
        monitor
        ;;
    setup-startup)
        setup_startup
        ;;
    save)
        save_config
        ;;
    web-dashboard)
        web_dashboard
        ;;
    cluster-info)
        cluster_info
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac