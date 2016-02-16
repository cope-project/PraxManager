# INSTALL

Please make sure the 'public' directory is unpacked under a Web-accessible directory. You shall see the following files and directories:

* bin - install script and application bootstrap
* data - all files are stored here
* docs - application documentation
* langs - language packs in json format
* lib - application static libraries
* models - database models
* plugins - plugins for report generation
* routes - application controllers
* views - application views
* app.js - application entry point
* config_sample.json - sample config
* package.json - application dependencies
* permissions.json - api permissions
* prax_manager_sample.json - pm2 process manager configuration

## Prerequisites
The minimum requirement by PraxManager is a linux server with 1 GB of RAM. PraxManager has been tested with CentOS, Ubuntu Server and Amazon Linux.

### Software
* node.js >= 5.3.0
* MongoDb >= 3.2
* pm2 - https://github.com/Unitech/pm2
* nginx >= 1.9.9

## Instalation

1. Clone or download and unpack PraxManager
1. Install nodejs dependencies (npm install)
1. Create a new config file from config_sample.json (e.g. config.json)
1. Create a new config file for pm2 form prax_manager_sample.json
1. Run the instalation script (e.g. node bin/install.js )
1. Start the app (e.g. pm2 start prax_manager.json)
1. Configure an nginx proxy
1. Login in the app using the credentials form the instalation script

