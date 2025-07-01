# PM2 Configuration for ChatPDF Application

This document describes the PM2 setup for the ChatPDF application with advanced clustering, monitoring, and deployment capabilities.

## 🚀 Features

- **Clustering**: Backend runs with multiple instances using all CPU cores
- **Advanced Monitoring**: Real-time dashboard and detailed logging
- **Auto-restart**: Automatic recovery from crashes
- **Memory Management**: Automatic restart on memory threshold
- **Load Balancing**: Built-in load balancer for backend instances
- **Deployment Workflows**: Automated deployment configurations
- **Health Monitoring**: Advanced health checks and graceful shutdowns

## 📁 Configuration Files

- `ecosystem.config.js` - Main PM2 configuration for development
- `ecosystem.production.config.js` - Production-optimized configuration
- `scripts/pm2-manage.sh` - Management script with easy commands

## 🛠️ Installation & Setup

PM2 is already installed and configured. To get started:

```bash
# Use the management script (recommended)
./scripts/pm2-manage.sh start

# Or use PM2 directly
pm2 start ecosystem.config.js --env development
```

## 📊 Services Configuration

### Backend (FastAPI)
- **Name**: `chatpdf-backend`
- **Instances**: Max CPU cores (clustering enabled)
- **Mode**: Cluster
- **Port**: 8001
- **Memory Limit**: 1GB (auto-restart)
- **Features**: Load balancing, health checks, graceful shutdown

### Frontend (React)
- **Name**: `chatpdf-frontend`
- **Instances**: 1 (single instance)
- **Mode**: Fork
- **Port**: 3000
- **Memory Limit**: 2GB (auto-restart)
- **Features**: Development server with hot reload

### MongoDB
- **Name**: `chatpdf-mongodb`
- **Instances**: 1
- **Mode**: Fork
- **Features**: Persistent data, optimized for database workload

## 🎛️ Management Commands

### Using the Management Script (Recommended)

```bash
# Start all services in development mode
./scripts/pm2-manage.sh start

# Start in production mode
./scripts/pm2-manage.sh start-prod

# Stop all services and switch back to supervisor
./scripts/pm2-manage.sh stop

# Restart all services
./scripts/pm2-manage.sh restart

# Show status and detailed information
./scripts/pm2-manage.sh status

# Show logs for all services
./scripts/pm2-manage.sh logs

# Show logs for specific service
./scripts/pm2-manage.sh logs chatpdf-backend

# Open monitoring dashboard
./scripts/pm2-manage.sh monitor

# Start web dashboard (http://localhost:9615)
./scripts/pm2-manage.sh web-dashboard

# Show clustering information
./scripts/pm2-manage.sh cluster-info

# Setup auto-start on system boot
./scripts/pm2-manage.sh setup-startup

# Save current configuration
./scripts/pm2-manage.sh save
```

### Direct PM2 Commands

```bash
# Start ecosystem
pm2 start ecosystem.config.js --env development
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 status
pm2 monit
pm2 logs --timestamp

# Control processes
pm2 restart all
pm2 stop all
pm2 delete all

# Specific service control
pm2 restart chatpdf-backend
pm2 stop chatpdf-frontend
pm2 logs chatpdf-mongodb

# Clustering operations
pm2 scale chatpdf-backend 4  # Scale to 4 instances
pm2 reload chatpdf-backend   # Zero-downtime reload

# Web dashboard
pm2 web  # Available at http://localhost:9615
```

## 📈 Monitoring & Dashboards

### Built-in Monitoring
```bash
# Terminal-based monitoring
pm2 monit

# Web dashboard
pm2 web  # http://localhost:9615

# Process information
pm2 show chatpdf-backend
pm2 describe chatpdf-backend
```

### Log Management
```bash
# Real-time logs
pm2 logs --timestamp
pm2 logs chatpdf-backend --lines 100

# Log files locations
/var/log/pm2/chatpdf-backend-*.log
/var/log/pm2/chatpdf-frontend-*.log
/var/log/pm2/chatpdf-mongodb-*.log
```

### Performance Monitoring
- **CPU Usage**: Real-time per process
- **Memory Usage**: With automatic restart thresholds
- **Restart Count**: Track application stability
- **Uptime**: Monitor service availability
- **Load Balancing**: Request distribution across instances

## 🏗️ Production Deployment

### Production Configuration
```bash
# Build frontend for production
cd /app/frontend && npm run build

# Start production services
pm2 start ecosystem.production.config.js

# Or use management script
./scripts/pm2-manage.sh start-prod
```

### Auto-startup Setup
```bash
# Setup PM2 to start on boot
pm2 startup
# Follow the instructions, then:
pm2 save
```

### Deployment Workflows
The configuration includes deployment setups for:
- **Development**: Auto-deployment from develop branch
- **Production**: Auto-deployment from main branch with production optimizations

```bash
# Deploy to production
pm2 deploy ecosystem.config.js production

# Deploy to development
pm2 deploy ecosystem.config.js development
```

## 🔄 Development vs Production

### Development Mode
- Watch mode disabled for stability
- Detailed logging
- Single backend worker
- React development server
- Quick restart times

### Production Mode
- Multiple backend workers (clustering)
- Optimized memory usage
- Built/compiled frontend served with 'serve'
- Enhanced error handling
- Graceful shutdowns

## 🛡️ Health & Recovery

### Automatic Recovery Features
- **Memory-based restart**: Restart if memory exceeds threshold
- **Minimum uptime**: Prevent restart loops
- **Maximum restarts**: Prevent infinite restart cycles
- **Graceful shutdown**: Proper cleanup on termination
- **Health checks**: Process health monitoring

### Manual Recovery
```bash
# Force restart a stuck process
pm2 restart chatpdf-backend --force

# Delete and recreate a process
pm2 delete chatpdf-backend
pm2 start ecosystem.config.js --only chatpdf-backend

# Reset restart counters
pm2 reset chatpdf-backend
```

## 🔀 Switching Between PM2 and Supervisor

### Switch to PM2
```bash
# Stop supervisor services
sudo supervisorctl stop all

# Start PM2 services
./scripts/pm2-manage.sh start
```

### Switch back to Supervisor
```bash
# Stop PM2 services
./scripts/pm2-manage.sh stop

# This automatically starts supervisor services
```

## 📊 Advanced Features

### Clustering Configuration
- **Load Balancing**: Automatic request distribution
- **Zero-downtime Reloads**: Update without service interruption
- **CPU Utilization**: Use all available CPU cores
- **Process Isolation**: Each instance runs in isolation

### Memory Management
- **Automatic Restart**: When memory exceeds limits
- **Memory Leak Detection**: Monitoring for memory issues
- **Resource Optimization**: Efficient resource usage

### Logging & Debugging
- **Structured Logging**: Timestamped logs with proper formatting
- **Log Rotation**: Automatic log management
- **Real-time Monitoring**: Live log streaming
- **Error Tracking**: Detailed error reporting

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Stop supervisor first
   sudo supervisorctl stop all
   ```

2. **Process Won't Start**
   ```bash
   # Check logs
   pm2 logs chatpdf-backend --lines 50
   
   # Check process details
   pm2 describe chatpdf-backend
   ```

3. **High Memory Usage**
   ```bash
   # Check memory usage
   pm2 monit
   
   # Restart specific process
   pm2 restart chatpdf-backend
   ```

4. **MongoDB Connection Issues**
   ```bash
   # Ensure MongoDB is running
   pm2 restart chatpdf-mongodb
   
   # Check MongoDB logs
   pm2 logs chatpdf-mongodb
   ```

### Performance Optimization
- Monitor CPU and memory usage regularly
- Adjust instance count based on load
- Use production configuration for deployment
- Enable log rotation for long-running services

## 📝 Configuration Customization

Edit `ecosystem.config.js` to customize:
- Instance count and clustering
- Memory limits and restart policies
- Environment variables
- Log file locations
- Health check parameters

## 🔗 Useful Links

- [PM2 Official Documentation](https://pm2.keymetrics.io/docs/)
- [PM2 Clustering Guide](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 Monitoring](https://pm2.keymetrics.io/docs/usage/monitoring/)
- [PM2 Deployment](https://pm2.keymetrics.io/docs/usage/deployment/)

---

**Note**: This setup provides enterprise-grade process management suitable for both development and production environments. The configuration can be further customized based on specific deployment requirements.