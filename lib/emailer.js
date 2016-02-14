/**
 * Send email module
 */

// laod nodemailer, email liibrary
var nodemailer = require('nodemailer');

// load smtp transport layer middleware
var smtpTransport = require('nodemailer-smtp-transport');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../' + config_file);

/**
 * Send mail notification
 * subject - The subject of the email
 * text - the text of the email in html format
 * to - email address 
 * callback - callback called when the email is sent
 */
function sendNotificationEmail(subject, text, to, callback){
    
    var transporter = nodemailer.createTransport(smtpTransport(config.email));
    transporter.sendMail({
	   'from':    	config.email.from, 
	   'to':     	to,
	   'subject': 	subject,
	   'html':	text, 
	}, callback);
};

// export module
module.exports = {
	'sendNotificationEmail': sendNotificationEmail
};