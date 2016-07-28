# PraxManager Development
PraxManager is a single page application that uses a Restful API to fetch and update data.
* https://en.wikipedia.org/wiki/Representational_state_transfer
* https://en.wikipedia.org/wiki/Single-page_application

## How to make database changes
To add new fields in the PraxManager api, you need to update the database model located in /models.
All models are implemented using mongoosejs ORM, for more documentation visit http://mongoosejs.com/.
Finally you need to update the rest api located in /routes to send the data to the model.
* https://en.wikipedia.org/wiki/Object-relational_mapping


## How to make UI changes
To make changes to the ui you need to update the .jade templates located in /views.
For documentation about the jade templating language visit: http://jade-lang.com/.

## Moodle integration
To connect PraxManager to moodle, the PraxManager application needs to have access to the moodle MySQL Server.
Moodle users can connect to PraxManager using moodle credentials if the moodle plugin is enabled in the configuration and 
the MySQL connection is defined in the configuration.

## Troubleshooting
Errors can be troubleshot by monitoring the logs of the pm2 app container or the standard output of the application.

## How to install PraxManager 
Check INSTALL.md file from the root of the project for instalation details.