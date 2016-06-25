/**
 * Form data API
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load form data model
var FormModel = require('./../models/form');

// load user identity interface
var Identity = require('./../lib/identity');

// load internships model
var InternshipModel = require('./../models/internship');

var UserModel = require('./../models/user');

// load export library
var Export = require('./../lib/prax/export');

// load excel library
var Excel = require('./../lib/excel');

// load moment library
var moment = require('moment');

// load language library
var lang = require('./../lib/lang');


/**
 * Create new form data entry
 */
router.post('', function(req, res) {
    var identity = new Identity(req.session);
	var date = moment(req.body.Date).startOf('day').utc();

    var form = new FormModel({
		'AccountId': identity.getAccountId(),
		'UserId': identity.getUserId(),
		'FormTemplateId': req.body.FormTemplateId,
		'InternshipId': req.body.InternshipId,
		'FormData': req.body.FormData,
		'ReviewFormData': req.body.ReviewFormData,
		'Date': date,
		'CompletedBy': req.body.CompletedBy
    });

	var query = {
		'AccountId': identity.getAccountId(),
		'UserId': identity.getUserId(),
		'InternshipId': req.body.InternshipId,
		'FormTemplateId': req.body.FormTemplateId,
		'Date': date,
    };

	FormModel.findOne(query, function(error, existingForm) {
		if (error) {
			return res.send(error, 500);
		}

		if (existingForm) {
			return res.send(existingForm);
		} else {
			return form.save(function(error) {
				if (error) {
					res.send(error, 500);
				} else {
					res.send(form, 201);
				}
			});
		}
	});
});

/**
 * Update form data entry
 */
router.put('/:id', function(req, res) {
    var identity = new Identity(req.session);
    var query = { '_id': req.params.id, 'AccountId': identity.getAccountId() };

    FormModel.findOne(query, function(error, form) {
		if (error || form == null) {
			return res.send(error, 500);
		}

		form.FormData = req.body.FormData;

		if (req.body.ReviewFormData) {
			form.ReviewFormData = req.body.ReviewFormData;
		}

		form.save(function(error, saved_form) {
			if (error) {
				return res.send(error, 500);
			}


			return res.send(saved_form);
		});
    });

});

/**
 * Check if a genera form exists
 */
router.get('/exists_general', function(req, res) {
    var identity = new Identity(req.session);
    var query = {
		AccountId: identity.getAccountId(),
		UserId: identity.getUserId(),
		FormTemplateId: req.query.formTemplateId,
		InternshipId: req.query.internshipId
	};
    FormModel.findOne(query, function(error, form) {
		if (error) {
			return res.send(error, 500);
		}

		if (form == null) {
			return res.send({ exists: false, 'form': form });
		}

		return res.send({ exists: true, 'form': form });
    })
});

/**
 * Check if a daily form exists
 */
router.get('/exists_daily', function(req, res) {
    var identity = new Identity(req.session);
    var query = {
		AccountId: identity.getAccountId(),
		UserId: identity.getUserId(),
		FormTemplateId: req.query.formTemplateId,
		InternshipId: req.query.internshipId,
		Date: req.query.date
	};
    FormModel.findOne(query, function(error, form) {
		if (error) {
			return res.send(error, 500);
		}

		if (form == null) {
			return res.send({ exists: false, 'form': form });
		}

		return res.send({ exists: true, 'form': form });
    })
});

/**
 * Fetch general forms for student and internship
 */
router.get('/query_general', function(req, res) {
    var identity = new Identity(req.session);
    var query = {
		AccountId: identity.getAccountId(),
		UserId: req.query.userId,
		//FormData: {Interval: 'once'},
		'FormData.Interval': 'once',
		InternshipId: req.query.internshipId,
	};
    FormModel.find(query, function(error, forms) {
		if (error) {
			return res.send(error, 500);
		}

		return res.send(forms);
    })
});

/**
 * Fetch daily forms for student and internship
 */
router.get('/query_daily', function(req, res) {
    var identity = new Identity(req.session);
    var query = {
		AccountId: identity.getAccountId(),
		UserId: req.query.userId,
		InternshipId: req.query.internshipId,
		'FormData.Interval': 'daily',
	};
    FormModel.find(query, function(error, forms) {
		if (error) {
			return res.send(error, 500);
		}

		return res.send(forms);
    })
});

/**
 * Query forms data
 */
router.get('/query', function(req, res) {

    var identity = new Identity(req.session);

    var query = {
		AccountId: identity.getAccountId(),
		UserId: req.query.userId,
		InternshipId: req.query.internshipId,
	};

    FormModel.find(query, function(error, forms) {

		if (error) {
			return res.send(error, 500);
		}

		return res.send(forms);
    })
});

/**
 * Generate internship summary in csv format
 */
router.get('/summary/csv', function(req, res) {

	var _ = lang._('forms');

    var identity = new Identity(req.session);

    var options = {
		accountId: identity.getAccountId(),
		formTemplateId: req.query.formId,
		internshipId: req.query.internshipId,
	};

	Export.InternshipFormMR.map(options, function(data) {
		if (!data) {
			return res.send({ 'Message': 'No data.' }, 500);
		}

		var summary = new Export.FormSummary(data);
		summary = summary.toArray();

		res.setHeader('Content-disposition', 'attachment; filename=summary_' + options.internshipId + '.xlsx');
		res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		var wb = new Excel.Workbook();
		var ws = Excel.Sheet.fromArray(summary);
		var internshipName = _('Empty');
		if (summary[1]) {
			internshipName = summary[1][0];
		}
		ws.sheetName = _('Internship Summary') + ' (' + internshipName + ')';
		wb.addSheet(ws);
		return res.send(wb.toStream());
	});
});

/**
 * Export forms to xlsx format
 */
router.get('/csv', function(req, res) {
	var _ = lang._('export');
	var identity = new Identity(req.session);

	var query = {
		AccountId: identity.getAccountId(),
		FormTemplateId: req.query.formId,
		InternshipId: req.query.internshipId
	};

	if(req.query.userId){
		query.UserId = req.query.userId;
	}
	
	var internshipQuery = { _id: req.query.internshipId, AccountId: identity.getAccountId() };
	var userQuery = { AccountId: identity.getAccountId() };

	if(req.query.userId){
		userQuery._id = req.query.userId;
	}
	
	var tabel = [[_('Date'), _('Student'), _('Internship'), _('Form'), _('Subject'), _('Question') , _('Question Type'), _('Answer'), _('Comment')]];

	var internshipPromise = new Promise(function(resolve, reject) {
		InternshipModel.findOne(internshipQuery, function(error, internship) {
			if (error || !internship) {
				return reject(error);
			}

			return resolve(internship);
		});
	})

	var userPromise = new Promise(function(resolve, reject) {
		UserModel.find(userQuery, function(error, user) {
			if (error || !user) {
				return reject(error);
			}

			return resolve(user);
		});
	});

	var formsPromise = new Promise(function(resolve, reject) {
		FormModel.find(query, function(error, forms) {
            if (error) {
                return reject(error);
            }
			return resolve(forms);
        });
	});

	function getUserById(users, id){
		return users.find(function (user) {
			return id == user._id.toString();
		}) || {};
	}

	Promise.all([internshipPromise, userPromise, formsPromise])
	.then(function(args) {
		var internship = args[0];
		var users = args[1];
		var forms = args[2];
		forms.forEach(function(form) {
			user = getUserById(users, form.UserId.toString())
			form.FormData.Questions.forEach(function(subject) {
				subject.Questions.forEach(function(question) {
					var studentName = user.FirstName + ' ' + user.LastName;
					var answer = question.Value;
					
					if(typeof answer === 'object'){
						if (question.Type === 'MultipleChoiceMultipleAnswer'){
							answer = question.Options.reduce(function (answer, value, index) {
								if(question.Value[index]){
									answer.push(value);
								}
								return answer;
							}, []).join(', ');
						} else {
							answer = _('Not available');
						}
					}
					
					tabel.push([form.Date, studentName, internship.Name, 
					form.FormData.Name, subject.Name, question.Question, 
					question.Type, answer ,question.Comment || '']);
				});
			});
		});
		
		res.setHeader('Content-disposition', 'attachment; filename=internship_forms_' + internship._id.toString() + '.xlsx');
		res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		var wb = new Excel.Workbook();
		var ws = Excel.Sheet.fromArray(tabel);
		var internshipName = internship.Name;
		ws.sheetName = _('Internship Forms') + ' (' + internshipName + ')';
		wb.addSheet(ws);
		return res.send(wb.toStream());
	}, function(error) {
		res.send(error, 500);
	});

});


// export module
module.exports = router;