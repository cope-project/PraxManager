# PM2 Setup
PM2 is a process manager for Node.js applications with a built-in load balancer. 
It allows you to keep applications alive forever, to reload them without downtime and
to facilitate common system admin tasks.

Starting an application in production mode is as easy as:

`$ pm2 start pm2_config.json`

For more documentation see:
https://github.com/Unitech/pm2

## Sample Configuration
    {
        "apps":[{ // multiple apps ca be defined
        "name": "prax_manager", // name of the application
        "script": "./bin/prax_manager", // start script
        "merge_logs": true,
        "ignore_watch": ["node_modules", "views", "public", "data", "docs"],
        "max_memory_restart": "200M",
        "env": {
            "DEBUG": "PraxManager",
            "TZ": "UTC",
            "CONFIG":"config.json",
            "PORT": "3000",
            "NODE_ENV": "development"
        }
        }]
    }