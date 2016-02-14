/**
 * Import users from a excel file
 */

// load XLSX library
var XLSX = require('xlsx');

// load user model
var UserModel = require('./../../models/user');

// load password lib used for hashing
var passwordlib = require('./../password');

// load language translation library
var lang = require('./../lang');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../../' + config_file)

// load emailer library used to send emails
var emailer = require('./../emailer');

/**
 * This class will upload users form a excel file
 */
function UsersUploader(path) {
    this.workbook = XLSX.readFile(path);
}


/**
 * This method is used to upload users 
 * callback will be called when all users are uploaded
 */
UsersUploader.prototype.uploadUsers = function (accountId, callback) {
    var notifications = new UserNotifications();
    var sheetName = this.workbook.SheetNames[0];
    var worksheet = this.workbook.Sheets[sheetName];
    var uploadedUsers = XLSX.utils.sheet_to_row_object_array(worksheet, { header: 1 });

    var status = {
        uploaded: 0,
        skipped: 0,
        rejected: []
    };

    function val(str) {
        if (str) {
            return str.trim();
        }

        return str;
    }

    /**
     * This function will pop an user from queue and insert it into the database
     * when the queue is empty callback will be called
     */
    function uploadUser(users) {

        if (users.length === 0) {
            return callback(status, users);
        }

        var userData = users.pop();
        var password = userData.password ? val(userData[3]) : 'changeme';
        var user = new UserModel({
            'AccountId': accountId,
            'FirstName': val(userData[0]),
            'LastName': val(userData[1]),
            'Email': val(userData[2]),
            'Password': passwordlib.hash(password),
            'Type': 'student',
            'Tag': val(userData[5]),
            'Status': 'active'
        });

        user.save(function (error, savedUser) {
            if (error) {
                status.skipped++;
                status.rejected.push({ user: user.toJSON(), error: error });
                return uploadUser(users);
            } else {
                notifications.newUser(user, password, function () {
                    // upload the next user
                    return uploadUser(users);
                });
                status.uploaded++;
            }
        });
    }

    uploadedUsers.shift(); // remove header
    // start upload
    return uploadUser(uploadedUsers);
};


/**
 * User notifications class
 */
function UserNotifications() {

}

/**
 * Send new user notification
 */
UserNotifications.prototype.newUser = function (user, password, callback) {
    var _ = lang._('users')
    var message = _("Your account is now ready to use.") + "\nPraxManager: http://" + config.domain;
    message += '\n' + _('Email') + ':' + user.Email;
    message += '\n' + _('Password') + ':' + password;
    message += '\n\n';
    var email = user.FirstName + '' + user.LastName + ' <' + user.Email + '>';
    var subject = "PraxManager - " + _('Account successfully created');

    return emailer.sendNotificationEmail(subject, message, email, function (error) {
        return callback(error);
    });
}

/**
 * Send password update notification
 */
UserNotifications.prototype.passwordUpdate = function (user, password, callback) {
    var _ = lang._('users');
    var message = _("Your password has been updated by the Administrator");
    message += "\n" + _('Your new password is') + ": " + password;
    var email = user.FirstName + '' + user.LastName + ' <' + user.Email + '>';
    var subject = "PraxManager - " + _('Your password has been updated');

    return emailer.sendNotificationEmail(subject, message, email, function (error) {
        return callback(error);
    });
}


// export
module.exports = {
    'UserNotifications': UserNotifications,
    'UsersUploader': UsersUploader
};