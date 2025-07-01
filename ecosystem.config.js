module.exports = {
  apps: [
    {
      name: 'chatpdf-backend',
      script: '/root/.venv/bin/uvicorn',
      args: 'backend.server:app --host 0.0.0.0 --port 8001 --workers 1',
      cwd: '/app',
      instances: 'max', // Use all CPU cores for clustering
      exec_mode: 'cluster',
      autorestart: true,
      watch: false, // Set to true for development, false for production
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: '8001'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: '8001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8001'
      },
      error_file: '/var/log/pm2/chatpdf-backend-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Health monitoring
      max_restarts: 10,
      min_uptime: '10s',
      // Graceful shutdown
      kill_timeout: 3000,
      listen_timeout: 3000,
      // Advanced monitoring
      pmx: true,
      source_map_support: false
    },
    {
      name: 'chatpdf-frontend',
      script: 'yarn',
      args: 'start',
      cwd: '/app/frontend',
      instances: 1, // React dev server should run single instance
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '3000',
        BROWSER: 'none',
        CI: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3000',
        BROWSER: 'none',
      },
      error_file: '/var/log/pm2/chatpdf-frontend-error.log',
      out_file: '/var/log/pm2/chatpdf-frontend-out.log',
      log_file: '/var/log/pm2/chatpdf-frontend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Health monitoring
      max_restarts: 5,
      min_uptime: '30s',
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
    {
      name: 'chatpdf-mongodb',
      script: '/usr/bin/mongod',
      args: '--bind_ip_all --dbpath /data/db --logpath /var/log/pm2/mongodb.log --fork',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/chatpdf-mongodb-error.log',
      out_file: '/var/log/pm2/chatpdf-mongodb-out.log',
      log_file: '/var/log/pm2/chatpdf-mongodb-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Health monitoring
      max_restarts: 3,
      min_uptime: '60s',
      // MongoDB specific
      kill_timeout: 10000,
      listen_timeout: 15000,
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: ['localhost'],
      ref: 'origin/main',
      repo: 'https://github.com/your-repo/chatpdf.git',
      path: '/app',
      'pre-deploy-local': '',
      'post-deploy': 'yarn install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    },
    development: {
      user: 'root',
      host: ['localhost'],
      ref: 'origin/develop',
      repo: 'https://github.com/your-repo/chatpdf.git',
      path: '/app',
      'post-deploy': 'yarn install && pm2 reload ecosystem.config.js --env development',
      env: {
        NODE_ENV: 'development'
      }
    }
  }
};