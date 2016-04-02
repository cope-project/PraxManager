/**
 * Form templates api
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load form template model
var FormTemplateModel = require('./../models/formtemplate');

// load user identity interface
var Identity = require('./../lib/identity');

// load fs lib
var fs = require('fs');

/**
 * Return all form templates
 */
router.get('', function (req, res) {
    var identity = new Identity(req.session);
	var query = { AccountId: identity.getAccountId(), Status: { $ne: 'deleted' } };
    FormTemplateModel.find(query, function (error, formTemplates) {
		if (error) {
			res.send(error, 500);
		} else {
			res.send(formTemplates)
		}
    })
});

/**
 * Get form template by id
 */
router.get('/:id', function (req, res) {
    var identity = new Identity(req.session);
	var query = { AccountId: identity.getAccountId(), '_id': req.params.id, Status: { $ne: 'deleted' } };
    FormTemplateModel.findOne(query, function (error, formTemplate) {
		if (error) {
			res.send(error, 500);
		} else {
			res.send(formTemplate)
		}
    })
});

/**
 * Creat new form template
 */
router.post('', function (req, res) {
    var identity = new Identity(req.session);
    var formTemplate = new FormTemplateModel({
		'AccountId': identity.getAccountId(),
		'Name': req.body.Name,
		'Category': req.body.Category,
		'Description': req.body.Description,
		'Questions': req.body.Questions,
		'QuestionsCount': req.body.QuestionsCount,
		'Intervals': req.body.Intervals,
		'Type': req.body.Type,
		'CompletedBy': req.body.CompletedBy,
		'Status': 'active',
		'PrintTemplate': req.body.PrintTemplate
    });

    formTemplate.save(function (error) {
		if (error) {
			res.send(error, 500);
		} else {
			res.send(formTemplate);
		}
    });
});

/**
 * Update form template
 */
router.put('/:id', function (req, res) {

    var identity = new Identity(req.session);
	var query = { AccountId: identity.getAccountId(), '_id': req.params.id, Status: { $ne: 'deleted' } };
    return FormTemplateModel.findOne(query, function (error, form) {

		form.Name = req.body.Name;
		form.Category = req.body.Category;
		form.Description = req.body.Description;
		form.Questions = req.body.Questions;
		form.QuestionsCount = req.body.QuestionsCount;
		form.PrintTemplate = req.body.PrintTemplate;
		form.Interval = req.body.Interval;
		form.Type = req.body.Type;
		form.CompletedBy = req.body.CompletedBy
		form.Intervals = req.body.Intervals;

		form.save(function (error) {
			if (error) {
				res.send(error);
			} else {
				res.send(form);
			}
		});
    });

});

/**
 * Delete form template
 */
router.delete('/:id', function (req, res) {

    var identity = new Identity(req.session);
    var query = { '_id': req.params.id, 'AccountId': identity.getAccountId(), Status: { $ne: 'deleted' } };

    return FormTemplateModel.findOne(query, function (error, formTemplate) {
		formTemplate.Status = 'deleted';
		formTemplate.save(function (error) {
			if (error) {
				res.send(error, 500);
			} else {
				res.send(formTemplate);
			}
		});
    });
});

/**
 * Get form template by id
 */
router.get('/:id/download', function (req, res) {
    var identity = new Identity(req.session);
	var query = { AccountId: identity.getAccountId(), '_id': req.params.id, Status: { $ne: 'deleted' } };

	FormTemplateModel.findOne(query, function (error, formTemplate) {
		if (error) {
			res.send(error, 500);
		} else {
			var filename = formTemplate.Name.replace(/\W/g, '');
			filename = 'form_' + filename + '.json';
			res.setHeader('Content-disposition', 'attachment; filename=' + filename);
			res.setHeader('Content-type', 'application/octet-stream');
			var form = formTemplate.toJSON();
			delete form._id;
			delete form.__v;
			delete form.AccountId;
			delete form.CreateDate;
			delete form.UpdateDate;
			delete form.Status;
			var bytes = JSON.stringify(form);
			return res.send(bytes);
		}
    })
});


/**
 * Upload form in json format
 */

router.post('/upload', function (req, res) {
	var identity = new Identity(req.session);

	if (req.files.upload_file == undefined) {
		return res.status(400).send({ 'Message': 'Upload file not sent' })
	}

	var file = req.files.upload_file;
	var form = JSON.parse(fs.readFileSync(file.path));
	form.AccountId = identity.getAccountId();
	form.Status = 'active';
    var formTemplate = new FormTemplateModel(form);

    formTemplate.save(function (error) {
		if (error) {
			res.send(error, 500);
		} else {
			res.send(formTemplate);
		}
    });
});

// export module
module.exports = router;