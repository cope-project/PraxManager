# Backup
This command will backup all the contents of the mongo db database 

`/usr/bin/mongodump --out /var/backups/prax_all$(date +%d-%m-%Y)`

## Daily Backup Crontab
This crontab will backup the database every day at midnight.

`0 0 * * *  /usr/bin/mongodump --out /var/backups/all$(date +%d-%m-%Y) >/dev/null 2>&1`