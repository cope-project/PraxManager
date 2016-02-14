/**
 * Internships API
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load moment for working with time
var moment = require('moment');

// load internships model
var InternshipModel = require('./../models/internship');

// load user identity interface
var Identity = require('./../lib/identity');


/**
 * Return all internships
 */
router.get('/', function (req, res) {
    var identity = new Identity(req.session);
	var query = { AccountId: identity.getAccountId(), Status: { $nin: ['deleted', 'archived'] } };

	// check if the user is assigned as admin
	if (identity.getUser().Type == 'teacher') {
		query.AssignedAdministrators = { $elemMatch: { _id: identity.getUserId() } };
	}

    return InternshipModel.find(query, function (err, internships) {
		if (!err) {
			return res.send(internships);
		} else {
			return res.send(err, 500);
		}
	});
});

/**
 * Create a new internship
 */
router.post('/', function (req, res) {

    var identity = new Identity(req.session);

    var internship = new InternshipModel({
		'AccountId': identity.getAccountId(),
		'Name': req.body.Name,
		'StartDate': moment(req.body.StartDate).startOf('day'),
		'EndDate': moment(req.body.EndDate).endOf('day'),
		'AssignedUsers': req.body.AssignedUsers,
		'AssignedForms': req.body.AssignedForms,
		'AssignedAdministrators': req.body.AssignedAdministrators,
		'Description': req.body.Description,
		'Institution': req.body.Institution,
		'Location': req.body.Location,
		'CompletionLimit': req.body.CompletionLimit,
		'ColectDataType': req.body.ColectDataType,
		'Status': 'active'
    });

	// assign teacher as admin
	if (identity.getUser().Type == 'teacher') {
		internship.AssignedAdministrators.push(identity.getUser());
	}

    internship.save(function (error) {
		if (error) {
			res.send(error, 500);
		} else {
			res.send(internship);
		}
    })
});


/**
 * Update internship
 */
router.put('/:id', function (req, res) {
    var identity = new Identity(req.session);
	var query = {
		AccountId: identity.getAccountId(),
		Status: { $nin: ['deleted', 'archived'] },
		'_id': req.params.id
	};

	// check is the teacher is assigned as admin
	if (identity.getUser().Type == 'teacher') {
		query.AssignedAdministrators = { $elemMatch: { _id: identity.getUserId() } };
	}

    return InternshipModel.findOne(query, function (error, internship) {
		internship.Name = req.body.Name
		internship.StartDate = moment(req.body.StartDate).startOf('day');
		internship.EndDate = moment(req.body.EndDate).endOf('day');
		internship.AssignedUsers = req.body.AssignedUsers
		internship.AssignedForms = req.body.AssignedForms
		internship.AssignedAdministrators = req.body.AssignedAdministrators;
		internship.Description = req.body.Description
		internship.Institution = req.body.Institution
		internship.Location = req.body.Location
		internship.CompletionLimit = req.body.CompletionLimit;
		internship.ColectDataType = req.body.ColectDataType;
		internship.Status = req.body.Status

		internship.save(function (error) {
			if (error) {
				res.send(error, 500);
			} else {
				res.send(internship);
			}
		});
    });

});

/**
 * Returns all internships that are assigned to the current user (used in students page)
 */
router.get('/my', function (req, res) {

    var identity = new Identity(req.session);
    var query = {
		AssignedUsers: { $elemMatch: { _id: identity.getUserId() } },
		AccountId: identity.getAccountId(),
		Status: { $nin: ['deleted', 'archived'] }
	};

	if (identity.getUser().Type == 'teacher') {
		query.AssignedAdministrators = { $elemMatch: { _id: identity.getUserId() } };
		delete query.AssignedUsers;
	}

    return InternshipModel.find(query, function (err, internships) {
		if (!err) {
			return res.send(internships);
		} else {
			return res.send(err, 500);
		}
	});
});

/**
 * Fetch internship by id
 */
router.get('/:id', function (req, res) {
	var identity = new Identity(req.session);
	var query = {
		AccountId: identity.getAccountId(),
		Status: { $nin: ['deleted', 'archived'] },
		'_id': req.params.id
	};

	// check if the teacher is admin
	if (identity.getUser().Type == 'teacher') {
		query.AssignedAdministrators = { $elemMatch: { _id: identity.getUserId() } };
	}
	
    return InternshipModel.findOne(query, function (err, internship) {
		if (!err) {
			return res.send(internship);
		} else {
			return res.send(err, 500);
		}
	});
});


/**
 * Delete internship
 */
router.delete('/:id', function (req, res) {

    var identity = new Identity(req.session);
    var query = {
		'_id': req.params.id,
		'AccountId': identity.getAccountId(),
		Status: { $nin: ['deleted', 'archived'] },
	};

	// check if the teacher is admin
	if (identity.getUser().Type == 'teacher') {
		query.AssignedAdministrators = { $elemMatch: { _id: identity.getUserId() } };
	}

    return InternshipModel.findOne(query, function (error, internship) {
		internship.Status = 'deleted';
		internship.save(function (error) {
			if (error) {
				res.send(error, 500);
			} else {
				res.send(internship);
			}
		});
    });
});

/**
 * Archive internship
 */
router.post('/:id/archive', function (req, res) {

    var identity = new Identity(req.session);
    var query = {
		'_id': req.params.id,
		'AccountId': identity.getAccountId(),
		Status: { $nin: ['deleted', 'archived'] }
	};

	// check if the teacher is admin
	if (identity.getUser().Type == 'teacher') {
		query.AssignedAdministrators = { $elemMatch: { _id: identity.getUserId() } };
	}
	
    return InternshipModel.findOne(query, function (error, internship) {
		internship.Status = 'archived';
		internship.save(function (error) {
			if (error) {
				res.send(error, 500);
			} else {
				res.send(internship);
			}
		});
    });
});

// export module
module.exports = router;