module.exports = {
  apps: [
    {
      name: 'chatpdf-backend',
      script: '/root/.venv/bin/uvicorn',
      args: 'backend.server:app --host 0.0.0.0 --port 8001 --workers 1 --reload',
      cwd: '/app',
      instances: 1, // Single instance for development with auto-reload
      exec_mode: 'fork',
      autorestart: true,
      watch: ['backend/'], // Watch backend directory for changes
      ignore_watch: ['node_modules', '*.log', '.git', '__pycache__', '*.pyc'],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: '8001',
        ENVIRONMENT: 'development'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: '8001',
        ENVIRONMENT: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8001',
        ENVIRONMENT: 'production'
      },
      error_file: '/var/log/pm2/chatpdf-backend-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Enhanced health monitoring
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      exponential_backoff_restart_delay: 100,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Advanced monitoring
      pmx: true,
      source_map_support: false,
      // Memory and CPU monitoring
      max_memory_restart: '1G',
      instance_var: 'INSTANCE_ID'
    },
    {
      name: 'chatpdf-frontend',
      script: 'yarn',
      args: 'start',
      cwd: '/app/frontend',
      instances: 1, // React dev server should run single instance
      exec_mode: 'fork',
      autorestart: true,
      watch: ['src/'], // Watch src directory for auto-reload
      ignore_watch: ['node_modules', 'build', '*.log', '.git'],
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '3000',
        BROWSER: 'none',
        CI: 'true',
        GENERATE_SOURCEMAP: 'false', // Faster builds in development
        FAST_REFRESH: 'true'
      },
      env_development: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '3000',
        BROWSER: 'none',
        CI: 'true',
        GENERATE_SOURCEMAP: 'false',
        FAST_REFRESH: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3000',
        BROWSER: 'none',
        GENERATE_SOURCEMAP: 'true'
      },
      error_file: '/var/log/pm2/chatpdf-frontend-error.log',
      out_file: '/var/log/pm2/chatpdf-frontend-out.log',
      log_file: '/var/log/pm2/chatpdf-frontend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Enhanced health monitoring
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 5000,
      exponential_backoff_restart_delay: 100,
      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 8000,
      // Development specific settings
      instance_var: 'INSTANCE_ID'
    },
    {
      name: 'chatpdf-mongodb',
      script: '/usr/bin/mongod',
      args: '--bind_ip_all --dbpath /data/db --logpath /var/log/pm2/mongodb.log',
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