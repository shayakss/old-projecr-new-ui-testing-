# 🚀 PM2 Installation Complete for ChatPDF Application

## ✅ Installation Summary

PM2 has been successfully installed and configured in your ChatPDF project with advanced clustering, monitoring, and deployment capabilities.

### 📊 What Was Installed

1. **PM2 Process Manager** (v6.0.8) - Globally installed
2. **Multiple Configuration Files**:
   - `ecosystem.config.js` - Full configuration with clustering and MongoDB
   - `ecosystem.simple.config.js` - Multi-port configuration 
   - `ecosystem.final.config.js` - **Recommended** single-instance configuration
   - `ecosystem.production.config.js` - Production-optimized setup

3. **Management Script**: `scripts/pm2-manage.sh` - Easy-to-use commands
4. **Comprehensive Documentation**: `PM2_SETUP.md` - Complete setup guide

### 🎯 Key Features Installed

- **✅ Clustering Support**: Multiple backend instances for load distribution
- **✅ Advanced Monitoring**: Real-time process monitoring and logging
- **✅ Auto-restart**: Automatic recovery from crashes and memory limits
- **✅ Deployment Workflows**: Automated deployment configurations
- **✅ Health Monitoring**: Process health checks and graceful shutdowns
- **✅ Log Management**: Structured logging with timestamps and rotation
- **✅ Memory Management**: Automatic restart on memory thresholds

## 🛠️ How to Use PM2

### Quick Start Commands

```bash
# Start all services with PM2
./scripts/pm2-manage.sh start

# Start in production mode
./scripts/pm2-manage.sh start-prod

# Stop PM2 and switch back to supervisor
./scripts/pm2-manage.sh stop

# Check status
./scripts/pm2-manage.sh status

# View logs
./scripts/pm2-manage.sh logs

# Monitor in real-time
./scripts/pm2-manage.sh monitor
```

### Direct PM2 Commands

```bash
# Start with configuration file
pm2 start ecosystem.final.config.js --env development

# Monitor processes
pm2 status
pm2 monit

# Control processes
pm2 restart all
pm2 stop all
pm2 reload all

# View logs
pm2 logs --timestamp
pm2 logs chatpdf-backend
```

## 📈 Monitoring Capabilities

### 1. Real-Time Monitoring
- CPU and memory usage per process
- Restart count and uptime tracking
- Error rate monitoring
- Log streaming with timestamps

### 2. Process Health Checks
- Automatic restart on crashes
- Memory limit enforcement (1GB backend, 2GB frontend)
- Minimum uptime requirements
- Graceful shutdown handling

### 3. Log Management
- Structured logs in `/var/log/pm2/`
- Separate error, output, and combined logs
- Timestamp formatting
- Log merging across instances

## 🏗️ Production Deployment

### Auto-startup Setup
```bash
# Setup PM2 to start on boot
pm2 startup
# Follow the instructions, then:
pm2 save
```

### Deployment Workflows
```bash
# Deploy to production
pm2 deploy ecosystem.final.config.js production

# Deploy to development
pm2 deploy ecosystem.final.config.js development
```

## 🔄 Current Status

**✅ System Tested**: Backend verification completed successfully
- Health endpoint: Working
- Models endpoint: Working (7 AI models)
- Sessions endpoint: Working

**✅ Supervisor Integration**: Seamless switching between PM2 and supervisor
- Can switch to PM2 when needed
- Can return to supervisor for normal operation
- No conflicts between process managers

## 🎛️ Configuration Files Explained

### Recommended: `ecosystem.final.config.js`
- **Best for**: Development and simple production deployments
- **Features**: Single backend instance, full monitoring, easy management
- **Usage**: `pm2 start ecosystem.final.config.js --env development`

### Advanced: `ecosystem.config.js`
- **Best for**: High-load production with clustering
- **Features**: Multiple backend instances, MongoDB management, full clustering
- **Usage**: `pm2 start ecosystem.config.js --env production`

### Production: `ecosystem.production.config.js`
- **Best for**: Production deployments with built frontend
- **Features**: Optimized for production, uses 'serve' for frontend
- **Usage**: `pm2 start ecosystem.production.config.js`

## 🚨 Important Notes

1. **Port Management**: Only one process manager can control ports at a time
   - Use `./scripts/pm2-manage.sh start` to switch to PM2
   - Use `./scripts/pm2-manage.sh stop` to switch back to supervisor

2. **MongoDB**: Currently managed by supervisor (separate from PM2)
   - MongoDB continues running independently
   - Can be included in PM2 configuration if needed

3. **Environment Variables**: All configurations respect your existing `.env` files
   - Backend uses existing environment variables
   - Frontend uses REACT_APP_BACKEND_URL

## 📚 Documentation

Complete documentation available in:
- **`PM2_SETUP.md`** - Comprehensive setup guide
- **`scripts/pm2-manage.sh help`** - Management script help

## 🎉 What's Next?

Your ChatPDF application now has enterprise-grade process management capabilities:

1. **For Development**: Use supervisor for normal development, switch to PM2 for testing clustering/monitoring
2. **For Production**: Use PM2 for automatic restarts, clustering, and advanced monitoring
3. **For Monitoring**: Use PM2's real-time monitoring to track application performance
4. **For Deployment**: Use PM2's deployment workflows for automated deployments

---

**🔧 Need Help?**
- Run `./scripts/pm2-manage.sh help` for command reference
- Check `PM2_SETUP.md` for detailed documentation
- Use `pm2 monit` for real-time process monitoring
- View logs with `pm2 logs --timestamp`