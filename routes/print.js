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

// load internship library
var InternshipModel = require('./../models/internship');

// load language translation library
var lang = require('./../lib/lang');


/**
 * Print student presence for a student in the 
 * context of an internship
 */
router.get('/student_presence', (req, res) => {
    let identity = new Identity(req.session);
    let query = {
        'InternshipId': req.query.internshipId,
        'AccountId': identity.getAccountId(),
        'UserId': req.query.userId,
        'Status': 'approved'
    };
    
    if (identity.getUser().Type === 'student') {
		query.UserId = identity.getUserId()
	}
    
    let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // aggregate checkins to tabel format
    let checkinsToTabel = (checkins, internship) => {
        let print = [['Week'].concat(days)];
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
    var identity = new Identity(req.session);

});

// export module
module.exports = router;