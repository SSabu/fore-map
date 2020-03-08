
module.exports = {
  apps : [
      {
        name: "foreclosure",
        script: "./app.js",
        watch: true,
        env: {
            "PORT": 5000,
            "NODE_ENV": "development"
        },
        env_production: {
            "PORT": 80,
            "NODE_ENV": "production",
        }
      }
  ]
}
