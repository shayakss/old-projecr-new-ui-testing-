module.exports = {
  apps: [
    {
      name: 'chatpdf-backend-8001',
      script: '/root/.venv/bin/python',
      args: '-m uvicorn backend.server:app --host 0.0.0.0 --port 8001',
      cwd: '/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_development: {
        NODE_ENV: 'development',
        PORT: '8001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8001'
      },
      error_file: '/var/log/pm2/chatpdf-backend-8001-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-8001-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-8001-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 3000,
      listen_timeout: 3000,
    },
    {
      name: 'chatpdf-backend-8002',
      script: '/root/.venv/bin/python',
      args: '-m uvicorn backend.server:app --host 0.0.0.0 --port 8002',
      cwd: '/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_development: {
        NODE_ENV: 'development',
        PORT: '8002'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8002'
      },
      error_file: '/var/log/pm2/chatpdf-backend-8002-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-8002-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-8002-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 3000,
      listen_timeout: 3000,
    },
    {
      name: 'chatpdf-backend-8003',
      script: '/root/.venv/bin/python',
      args: '-m uvicorn backend.server:app --host 0.0.0.0 --port 8003',
      cwd: '/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_development: {
        NODE_ENV: 'development',
        PORT: '8003'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8003'
      },
      error_file: '/var/log/pm2/chatpdf-backend-8003-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-8003-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-8003-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 3000,
      listen_timeout: 3000,
    },
    {
      name: 'chatpdf-backend-8004',
      script: '/root/.venv/bin/python',
      args: '-m uvicorn backend.server:app --host 0.0.0.0 --port 8004',
      cwd: '/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_development: {
        NODE_ENV: 'development',
        PORT: '8004'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8004'
      },
      error_file: '/var/log/pm2/chatpdf-backend-8004-error.log',
      out_file: '/var/log/pm2/chatpdf-backend-8004-out.log',
      log_file: '/var/log/pm2/chatpdf-backend-8004-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 3000,
      listen_timeout: 3000,
    },
    {
      name: 'chatpdf-frontend',
      script: 'yarn',
      args: 'start',
      cwd: '/app/frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env_development: {
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
      max_restarts: 5,
      min_uptime: '30s',
      kill_timeout: 5000,
      listen_timeout: 8000,
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
      'post-deploy': 'yarn install --production && pm2 reload ecosystem.multiport.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    },
    development: {
      user: 'root',
      host: ['localhost'],
      ref: 'origin/develop',
      repo: 'https://github.com/your-repo/chatpdf.git',
      path: '/app',
      'post-deploy': 'yarn install && pm2 reload ecosystem.multiport.config.js --env development',
      env_development: {
        NODE_ENV: 'development'
      }
    }
  }
};