module.exports = {
  apps: [{
    name: 'video-chat-server',
    script: './server.js',
    exec_mode: 'cluster',
    instances: 'max',
    env: {
      NODE_ENV: 'production',
    },
  }],
};