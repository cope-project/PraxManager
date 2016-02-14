/**
 * Notificcations API
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load emailer library used to send emails
var emailer = require('./../lib/emailer');

// load user identity interface
var Identity = require('./../lib/identity');

// load language translation library
var lang = require('./../lib/lang');

/* Returns system notifications. */
router.get('/', function (req, res) {
	// @TODO
    res.send([])
});

/**
 * Send a notification message to a student via mail
 */
router.post('/send_student_notification', function (req, res) {
	var _ = lang._('notifications')
	var identity = new Identity(req.session);
	var user = identity.getUser();

	var studentFullname = req.body.StudentFullName;
	var studentEmail = req.body.StudentMail;
	var teacherFullname = identity.getUserDisplayName();
	var teacherMessage = req.body.Message;

	if (!studentFullname || !studentEmail || !teacherMessage) {
		return res.send({ Error: 'Validation error' }, 409);
	}

	var email = studentEmail + ' <' + studentEmail + '>';
	var subject = "PraxManager " + _('Notification from') + " " + teacherFullname;

	emailer.sendNotificationEmail(subject, teacherMessage, email, function (error) {
		if (error) {
			return res.send(error, 501);
		} else {
			return res.send({});
		}
	});
});

// export module
module.exports = router;