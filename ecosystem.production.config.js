module.exports = {
  apps: [
    {
      name: 'chatpdf-backend-prod',
      script: '/root/.venv/bin/uvicorn',
      args: 'backend.server:app --host 0.0.0.0 --port 8001 --workers 4',
      cwd: '/app',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: '8001',
        LOG_LEVEL: 'info'
      },
      error_file: '/var/log/pm2/chatpdf-backend-prod-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-prod-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-prod-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Production optimizations
      max_restarts: 15,
      min_uptime: '30s',
      kill_timeout: 5000,
      listen_timeout: 5000,
      // Advanced monitoring
      pmx: true,
      // Clustering configuration
      instance_var: 'INSTANCE_ID',
      // Health check
      health_check_grace_period: 3000,
    },
    {
      name: 'chatpdf-frontend-prod',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: '/app/frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      error_file: '/var/log/pm2/chatpdf-frontend-prod-error.log',
      out_file: '/var/log/pm2/chatpdf-frontend-prod-out.log',
      log_file: '/var/log/pm2/chatpdf-frontend-prod-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 3000,
      listen_timeout: 5000,
    }
  ]
};