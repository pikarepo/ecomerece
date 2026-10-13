module.exports = {
  apps: [
    {
      name: 'hono-bun',
      script: 'bun',
      args: 'run ./dist/index.js', // compiled output from `bun run build`
      instances: 1, // or 'max' for multiple (but see below)
      exec_mode: 'fork', // Bun doesn't support Node cluster mode
      watch: false, // turn on only for development
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        // Add other env vars here (or use .env – Bun loads it automatically)
      },
      max_memory_restart: '300M', // optional
      error_file: './logs/err.log', // custom logs
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
