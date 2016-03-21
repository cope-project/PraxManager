/**
 * Checkin API
 */

// load express and expres router
var express = require('express');
var router = express.Router();

// load moment time library
var moment = require('moment');

// load checkin library
var CheckinModel = require('./../models/checkin');

// load identity library
var Identity = require('./../lib/identity');

// load user model library
var UserModel = require('./../models/user');

// load internship library
var InternshipModel = require('./../models/internship');

// load excel library
var Excel = require('./../lib/excel');

// load language library
var lang = require('./../lib/lang');

/**
 * Create new checkin entry
 */
router.post('/:id', function (req, res) {

    var identity = new Identity(req.session);
	var date = moment(req.body.Date).startOf('day').utc();
	
    var checkin = new CheckinModel({
		'AccountId': identity.getAccountId(),
		'UserId': identity.getUserId(),
		'InternshipId': req.params.id,
		'Date': date,
		'Type': req.body.Type,
		'Time': req.body.Time,
		'Comment': req.body.Comment,
		'MediaFileComment': req.body.MediaFileComment,
    });

	var query = {
		'AccountId': identity.getAccountId(),
		'UserId': identity.getUserId(),
		'InternshipId': req.params.id,
		'Date': date,
    };

    CheckinModel.findOne(query, function (error, existingCheckin) {
		if (error) {
			return res.send(error, 500);
		}

		if (existingCheckin) {
			return res.send(existingCheckin);
		} else {
			return checkin.save(function (error) {
				if (error) {
					res.send(error, 500);
				} else {
					res.send(checkin, 201);
				}
			})
		}
	});


});

/**
 * Check if checkin exists on a Date
 */
router.get('/:id/checkedin', function (req, res) {
    var identity = new Identity(req.session);
    var query = {
		'InternshipId': req.params.id,
		'AccountId': identity.getAccountId(),
		'UserId': identity.getUserId(),
		'Date': req.query.date

    };

    CheckinModel.findOne(query, function (error, checkin) {
		if (error) {
			return res.send(error, 500);
		}

		if (checkin == null) {
			return res.status(404).end();
		}

		return res.status(200).send(checkin).end();
    });
});


/**
 * Update checkin
 */
router.put('/:id', function (req, res) {

    var identity = new Identity(req.session);

    var query = {
		'_id': req.params.id,
		'AccountId': identity.getAccountId(),
    };

	if (identity.getUser().Type === 'student') {
		query.UserId = identity.getUserId()
	}

    CheckinModel.findOne(query, function (error, checkin) {
		if (error) {
			return res.send(error, 500);
		}

		if (checkin == null) {
			return res.status(404).end();
		}

		checkin.Time = req.body.Time;
		checkin.Comment = req.body.Comment;
		checkin.MediaFileComment = req.body.MediaFileComment;

		if (identity.getUser().Type !== 'student') {
			checkin.Status = req.body.Status;
			checkin.RejectionComment = req.body.RejectionComment;
		}

		checkin.save(function (error, savedCheckin) {
			if (error) {
				return res.status(500).send(error).end();
			}
			return res.status(200).send(savedCheckin).end();
		})


    });
});

/**
 * Query checkins by user
 */
router.get('/query', function (req, res) {
    var identity = new Identity(req.session);
    var query = {
		'InternshipId': req.query.internshipId,
		'AccountId': identity.getAccountId(),
		'UserId': req.query.userId,

    };

    CheckinModel.find(query, function (error, checkins) {
		if (error) {
			return res.send(error, 500);
		}

		return res.status(200).send(checkins).end();
    });
});

/**
 * Query checkins by date
 */
router.get('/query_by_date', function (req, res) {
    var identity = new Identity(req.session);
	var date = moment(req.query.date).startOf('day').utc().format();
    var query = {
		'InternshipId': req.query.internshipId,
		'AccountId': identity.getAccountId(),
		'Date': date,
    };

    CheckinModel.find(query, function (error, checkins) {
		if (error) {
			return res.send(error, 500);
		}

		return res.status(200).send(checkins).end();
    });
});

/**
 * Fetch all checkins for the current user
 */
router.get('/my_checkins', function (req, res) {

    var identity = new Identity(req.session);

    var query = {
		'InternshipId': req.query.internshipId,
		'AccountId': identity.getAccountId(),
		'UserId': identity.getUserId(),

    };

    CheckinModel.find(query, function (error, checkins) {
		if (error) {
			return res.send(error, 500);
		}

		return res.status(200).send(checkins).end();
    });
});

/**
 * Download checkins in csv format
 */
router.get('/csv', function (req, res) {
    var identity = new Identity(req.session);
	var _ = lang._('checkin');
	
    var query = {
		'InternshipId': req.query.internshipId,
		'AccountId': identity.getAccountId(),
    };

	if (req.query.userId) {
		query['UserId'] = req.query.userId;
	}

    CheckinModel.find(query, function (error, checkins) {

		if (error) {
			return res.send(error, 500);
		}

		InternshipModel.findOne({ '_id': req.query.internshipId }, function (error, internship) {
			if (error || !internship) {
				return res.send(error, 500);
			}

			var allowedUsers = []; // skip all teachers from reporting
			internship.AssignedUsers.forEach(function (user) {
				allowedUsers.push(user._id.toString());
			});

			if (req.query.userId) {
				UserModel.findOne({ '_id': req.query.userId }, function (error, user) {
					if (error || !user) {
						return res.send(error, 500);
					}

					res.setHeader('Content-disposition', 'attachment; filename=summary_' + req.query.internshipId + '.xlsx');
					res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
					
					var header = [_('Internship'), _('Collect Data'), _('Student FullName'), _('Date'),
						_('Create Date'), _('Comment'), _('Status'), _('Time'), _('Rejection Comment')];
					var rows = [];
					checkins.forEach(function (checkin) {
						var fullName = user.FirstName + ' ' + user.LastName;
						var row = [internship.Name, internship.ColectDataType, fullName, checkin.Date, checkin.CreateDate,
							checkin.Comment, checkin.Status, checkin.Time, checkin.RejectionComment];
						rows.push(row)
					});

					rows.unshift(header);

					var wb = new Excel.Workbook();
					var ws = Excel.Sheet.fromArray(rows);
					ws.sheetName = _('Student Presence') + ' (' + internship.Name + ')';
					wb.addSheet(ws);
					return res.send(wb.toStream());
				});
			} else {
				UserModel.find({ 'AccountId': identity.getAccountId() }, function (error, users) {
					if (error || !users) {
						return res.send(error, 500);
					}

					function get_user(id, _users) {
						var u = {};
						_users.forEach(function (user, index) {
							if (user._id.toString() == id.toString()) {
								u = user;
							}
						});

						return u;
					}

					res.setHeader('Content-disposition', 'attachment; filename=summary_' + req.query.internshipId + '.xlsx');
					res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

					var header = [_('Internship'), _('Collect Data'), _('Student FullName'), _('Date'),
						_('Create Date'), _('Comment'), _('Status'), _('Time'), _('Rejection Comment')];
					var rows = [];
					checkins.forEach(function (checkin) {
						// skip all teachers from reporting
						if (allowedUsers.indexOf(checkin.UserId.toString()) === -1) {
							return;
						}

						var user = get_user(checkin['UserId'], users);
						var fullName = user.FirstName + ' ' + user.LastName;
						var row = [internship.Name, internship.ColectDataType, fullName, checkin.Date, checkin.CreateDate,
							checkin.Comment, checkin.Status, checkin.Time, checkin.RejectionComment];
						rows.push(row)
					});

					rows.unshift(header);

					var wb = new Excel.Workbook();
					var ws = Excel.Sheet.fromArray(rows);
					ws.sheetName =  _('Student Presence') + ' (' + internship.Name + ')';
					wb.addSheet(ws);
					return res.send(wb.toStream());
				});
			}
		});
    });
});


// export module
module.exports = router;