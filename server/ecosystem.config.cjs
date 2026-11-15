module.exports = {
  apps: [
    {
      name: 'breakout-backend',
      script: 'src/index.mjs',
      cwd: '/home/esv2/breakout-backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
