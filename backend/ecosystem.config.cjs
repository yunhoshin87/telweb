module.exports = {
  apps: [
    {
      name: "telweb",
      script: "server.js",
      node_args: "--env-file=.env",
      interpreter: "node",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
