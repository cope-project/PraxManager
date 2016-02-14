# Application Configuration
When setting up PraxManager, you can set the following options:

    {
        // mongo db connection string - https://docs.mongodb.org/v3.0/reference/connection-string/
        "mongodb": "mongodb://127.0.0.1/prax",
        
        // base domain form where the app is served
        "domain":"prax.cope-project.eu",
        
        // the name of the language pack file without the extension
        "lang":"ro",
        
        // Application session configuration
        // https://github.com/expressjs/session#options
        "session":{
            "secret": "change_me", // secret encryption key
            "resave": false,
            "saveUninitialized": true
        },
        
        // Moodle integration configuration
        "moodle": {
            "enable": false, //enable moodle integration
            "secret": "", // moodle secret key
            "version": "2.8", // moodle version
            "account": "54cc8a1483d811001731df89", // PraxManager account id generated on instalation
            "database": { // mysql connection configuration - https://github.com/felixge/node-mysql#connection-options
                "host": "localhost",
                "database": "moodle",
                "user": "root",
                "password": "test",
                "prefix": "cope_",
                "port":3311
            }
        },
        
        // Email server configuration 
        "email": { // - https://github.com/nodemailer/nodemailer-smtp-transport#usage
            "host":    "smtp.mailgun.org",
            "from": "Cope Project <copeproject@cope-project.eu>",
            "connectionTimeout": 10000,
            "port": 2525,
            "auth": {
                "user": "postmaster@sandboxe3e341776f5042f3819d6e669f16f1b0.mailgun.org",
                "pass": "0bb1de8c943778bd200ddcccef0ded38"
            }
        },

        // Plugins can be registred here
        "plugins": { 
            "formatters": { // plugins used to download data in a custom format
                "default": "Default HTML"
            }
        },
        
        // Path to the storage path
        "storage": { 
            "dest": "./data/"
        },
        
        "forms": { // forms categories
            "categories": []
        }
    }