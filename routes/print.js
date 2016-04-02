"use strict";
/**
 * Print data module
 */
// load express and express router
let express = require('express');
let router = express.Router();

// load configuration
let config_file = process.env.CONFIG;
let config = require('./../' + config_file)

// load user identity interface
let Identity = require('./../lib/identity');

// date time library
let moment = require('moment');

// load checkin library
var CheckinModel = require('./../models/checkin');

// load user model library
var UserModel = require('./../models/user');

var FormModel = require('./../models/form')

// load internship library
var InternshipModel = require('./../models/internship');

// load form templates library
var FormsTemplateModel = require('./../models/formtemplate');

// load language translation library
var lang = require('./../lib/lang');

// load plugins
var plugins = require('./../plugins/plugins');


/**
 * Print student presence for a student in the 
 * context of an internship
 */
router.get('/student_presence', (req, res) => {
    let identity = new Identity(req.session);
    var _ = lang._('print');
    let query = {
        'InternshipId': req.query.internshipId,
        'AccountId': identity.getAccountId(),
        'UserId': req.query.userId,
        'Status': 'approved'
    };
    
    if (identity.getUser().Type === 'student') {
		query.UserId = identity.getUserId()
	}
    
    let days = [_('Monday'), _('Tuesday'), _('Wednesday'), _('Thursday'), _('Friday'), _('Saturday'), _('Sunday')];

    // aggregate checkins to tabel format
    let checkinsToTabel = (checkins, internship) => {
        let print = [[_('Week')].concat(days)];
        let tabel = checkins.reduce((tabel, dayData) => {
            let day = moment(dayData.Date);
            let week = day.week();
            if (!tabel[week]) { tabel[week] = {}; }
            let dayOfTheWeek = day.isoWeekday();

            if (!tabel[week][dayOfTheWeek]) {
                tabel[week][dayOfTheWeek] = day;
            }
            return tabel;
        }, {});

        let startWeek = moment(internship.StartDate).week();
        let endWeek = moment(internship.EndDate).week();
        let index = 1;
        // populate tabel
        while(startWeek <= endWeek){
            let firstDayOfTheWeek = moment().day("Monday").week(startWeek);
            print.push([index].concat(days.map((day, index) => {
                if (tabel[startWeek] && tabel[startWeek][index + 1]) {
                    return 'X';
                }
                return ' ';
            })));
            startWeek++;
            index++;
        }
        Object.keys(tabel).forEach((week, index) => {

        });

        return print;
    };
    
    let internshipPromise = new Promise((resolve, reject) => {
        let query = { '_id': req.query.internshipId, 'AccountId': identity.getAccountId()};
        
        InternshipModel.findOne(query, (error, internship) => {
            if(error || !internship) {return reject(error);}
            return resolve(internship);
        });
    })
    
    internshipPromise.then(internship => {
        let checkinsPromise = new Promise((resolve, reject) => {
            CheckinModel.find(query, (error, checkins) => {
                if (error) { return reject(error); }
                let tabel = checkinsToTabel(checkins, internship);
                return resolve(tabel);
            });
        })
        
        let userPromise = new Promise((resolve, reject) => {
            let query = { 
            '_id': req.query.userId, 
            'AccountId': identity.getAccountId() };
            
            UserModel.findOne(query, (error, user) => {
                if(error || !user) {return reject(error);}
                return resolve(user);
            });
        });
        
         Promise.all([checkinsPromise, userPromise])
        .then(data => {
            let options = {
                title: 'Student presence',
                'identity': identity,
                'lang': lang,
                'checkins': data[0],
                'user': data[1],
                'internship': internship
            };
            res.render('print/student_presence', options, (error, html) => {
                if(error) res.send(error, 500);
                res.send(html) 
            });
        }, error => {
            res.send(error, 500);
        });
    }, error => {
        res.send(error, 500);
    })
    

});


/**
 * Print students forms in the context of an intenship
 */
router.get('/form', function(req, res) {
	var _ = lang._('export');
	var identity = new Identity(req.session);

	var query = {
		AccountId: identity.getAccountId(),
		FormTemplateId: req.query.formId,
		InternshipId: req.query.internshipId,
		UserId: req.query.userId
	};

	var internshipQuery = { _id: req.query.internshipId, AccountId: identity.getAccountId() };
	var userQuery = { _id: req.query.userId, AccountId: identity.getAccountId() };
    var formsTemplateQuery = {_id: req.query.formId, AccountId: identity.getAccountId()};
	
    var internshipPromise = new Promise(function(resolve, reject) {
		InternshipModel.findOne(internshipQuery, function(error, internship) {
			if (error || !internship) {
				return reject(error);
			}
			return resolve(internship);
		});
	})

	var userPromise = new Promise(function(resolve, reject) {
		UserModel.findOne(userQuery, function(error, user) {
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
    
    var formsTemplatePromise = new Promise(function(resolve, reject) {
        FormsTemplateModel.findOne(formsTemplateQuery, function (error, template) {
            if (error || !template) {
                return reject(error);
            }
            return resolve(template);
        });
    });
    

	Promise.all([internshipPromise, userPromise, formsPromise, formsTemplatePromise])
	.then(function(args) {
		var internship = args[0];
		var user = args[1];
		var forms = args[2];
        var template = args[3];
		var formater = plugins.getFormatPlugins().find(function (plugin) {
            return template.PrintTemplate === plugin.id;
        });
        
        if(!formater){
            return res.send({'message': 'plugin not found'}, 500);
        }
        
        return formater.format(internship, user, forms, function (html) {
            res.send(html);
        }, lang);
	}, function (error) {
         res.send(error);
    });

});

// export module
module.exports = router;