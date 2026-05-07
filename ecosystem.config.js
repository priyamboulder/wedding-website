module.exports = {
  apps: [
    {
      name: "marigold",
      script: "node",
      args: ".next/standalone/server.js",
      cwd: "C:\\sites\\marigold",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
