module.exports = {
  apps: [{
    name: 'adivina-el-numero',
    script: 'npm',
    args: 'start -- -p 3607',
    cwd: '/home/gelt/apps/adivina-el-numero',
    env: {
      NODE_ENV: 'production',
      PORT: 3607,
    },
  }],
}
