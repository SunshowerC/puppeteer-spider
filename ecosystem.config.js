module.exports = {
  apps: [
    {
      name: 'puppeteer',
      script: '',
      autorestart: true,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm',
      merge_logs: true,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
