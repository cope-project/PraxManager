/**
 * Users API
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load user model
var UserModel = require('./../models/user');

// load user identity interface
var Identity = require('./../lib/identity');

// load password lib used for hashing
var passwordlib = require('./../lib/password');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../' + config_file)

// load emailer library used to send emails
var emailer = require('./../lib/emailer');

// load language translation library
var lang = require('./../lib/lang');

// load emailer library used to send emails
var userslib = require('./../lib/prax/users');

/**
 * GET all users
 */
router.get('/', function (req, res) {

	var range = {};
	range.limit = req.query.limit || 30;
	range.skip = req.query.skip || 0;

    var identity = new Identity(req.session);
	var query = { AccountId: identity.getAccountId(), Status: { $ne: 'deleted' } };

	if (req.query.type) {
		var types = req.query.type.split(',');
		query.Type = { '$in': types };
	}

	var usersPromise = new Promise(function (resolve, reject) {
		UserModel.find(query)
			.limit(range.limit)
			.skip(range.skip)
			.sort({ FirstName: 1, LastName: 1 })
			.exec(function (err, users) {
				if (!err) {
					resolve(users);
				} else {
					reject(err);
				}
			});
	});

	var countPromise = new Promise(function (resolve, reject) {
		UserModel.count(query, function( err, count){
			if(!err){
				resolve(count);
			}else{
				reject(err);
			}
		});
	});

	Promise.all([usersPromise, countPromise]).then(function (args) {
		res.setHeader("X-Items-Count", args[1]);
		res.send(args[0]).end();
	}).catch(function (reason) {
		res.send(reason, 500).end();
	});
});

/**
 * Create new user
 */
router.post('', function (req, res) {

    var identity = new Identity(req.session);
    var passwd = passwordlib.random();
	var _ = lang._('users')

    var user = new UserModel({
		'AccountId': identity.getAccountId(),
		'FirstName': req.body.FirstName,
		'LastName': req.body.LastName,
		'Email': req.body.Email,
		'Password': passwordlib.hash(passwd),
		'Type': req.body.Type,
		'Tag': req.body.Tag,
		'Status': 'active'
    });

    user.save(function (error) {
		if (error) {
			return res.send(error, 409);
		} else {
			// send user notification on create
			var notifications = new userslib.UserNotifications();
			return notifications.newUser(user, passwd, function (error) {
				if (error) {
					return res.send(error, 500);
				} else {
					return res.send(user);
				}
			})
		}
    });
});

/**
 * Send password to user
 */
router.put('/send_password/:id', function (req, res) {
	var _ = lang._('users')
    var identity = new Identity(req.session);
    var query = {
		'_id': req.params.id,
		'AccountId': identity.getAccountId(),
		Status: { $ne: 'deleted' }
	};
    var passwd = passwordlib.random();

    return UserModel.findOne(query, function (error, user) {
		user.Password = passwordlib.hash(passwd)

		user.save(function (error) {
			if (error) {
				return res.send(error, 409);
			} else {
				var notifications = new userslib.UserNotifications();
				return notifications.passwordUpdate(user, passwd, function (error) {
					if (error) {
						return res.send(error, 500);
					} else {
						return res.send(user);
					}
				});
			}
		});
    });

});

/**
 * Update user
 */
router.put('/:id', function (req, res) {

    var identity = new Identity(req.session);
    var query = {
		'_id': req.params.id,
		'AccountId': identity.getAccountId(),
		Status: { $ne: 'deleted' }
	};

    return UserModel.findOne(query, function (error, user) {
		user.FirstName = req.body.FirstName
		user.LastName = req.body.LastName
		user.Type = req.body.Type
		user.Tag = req.body.Tag

		user.save(function (error) {
			if (error) {
				res.send(error, 409);
			} else {
				res.send(user);
			}
		});
    });

});


/**
 * Delete user
 */
router.delete('/:id', function (req, res) {

    var identity = new Identity(req.session);
    var query = { '_id': req.params.id, 'AccountId': identity.getAccountId() };
    return UserModel.findOne(query, function (error, user) {
		user.Status = 'deleted';
		user.save(function (error) {
			if (error) {
				res.send(error);
			} else {
				res.send(user);
			}
		});
    });
});


/**
 * Fetch user by id
 */
router.get('/:id', function (req, res) {

    var identity = new Identity(req.session);
    var query = { '_id': req.params.id, 'AccountId': identity.getAccountId(), Status: { $ne: 'deleted' } };
    return UserModel.findOne(query, function (error, user) {

		if (error) {
			return res.send(error, 500);
		}

		if (user == null) {
			return res.send(user, 404);
		}

		return res.send(user);

    });
});

/**
 * Upload xlsx file with users
 */
router.post('/upload', function (req, res) {

	var identity = new Identity(req.session);
	var _ = lang._('users')

	if (req.files.upload_file == undefined) {
		return res.status(400).send({ 'Message': 'Upload file not sent' })
	}

	var file = req.files.upload_file;
	var accountId = identity.getAccountId();
	var uploader = new userslib.UsersUploader(file.path);
	return uploader.uploadUsers(accountId, function (status) {
		return res.send(status);
	});
});

// export module
module.exports = router;
