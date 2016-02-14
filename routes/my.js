/**
 * My profile API
 */
// load express and express router
var express = require('express');
var router = express.Router();

// load user model
var UserModel = require('./../models/user');

// load identity interface
var Identity = require('./../lib/identity');

// load password library used for hashing
var passwordlib = require('./../lib/password');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../' + config_file);

// load emailer library used to send mails
var emailer = require('./../lib/emailer');

/**
 * Update user profile (current user)
 */
router.put('', function (req, res) {
    
    var identity = new Identity(req.session);
    var query = {'_id':identity.getUserId(), 'AccountId' : identity.getAccountId()};
    
    return UserModel.findOne(query, function (error, user) {
	
	console.log(error);
	if(error){
	    return res.send(error, 500);
	}
	
	user.FirstName = req.body.FirstName
	user.LastName = req.body.LastName
	
	user.save(function (error) {
	    if (error) {
		return res.send(error);
	    }else{
		identity.setUser(user);
		return res.send(user);
	    }
	});
    });

});


/**
 * Change password (current user)
 */
router.put('/change_password', function (req, res) {
    
    var identity = new Identity(req.session);
    var query = {'_id':identity.getUserId(), 'AccountId' : identity.getAccountId()};
    
    return UserModel.findOne(query, function (error, user) {
	
	if(error){
	    return res.send(error, 500);
	}
	
	var password = passwordlib.hash(req.body.Password);
	if(user.Password != password){
	    return res.send({}, 400);
	}
	
	
	if(req.body.NewPassword != req.body.RetypeNewPassword){
	    return res.send({}, 400);
	}
	
	user.Password = passwordlib.hash(req.body.NewPassword);
	
	console.log(user.Password, req.body.NewPassword);
	
	user.save(function (error) {
	    if (error) {
		return res.send(error);
	    }else{
		return res.send(user);
	    }
	});
    });

});

/**
 * Update user settings
 */
router.put('/settings', function (req, res) {
    
    var identity = new Identity(req.session);
    var query = {'_id':identity.getUserId(), 'AccountId' : identity.getAccountId()};
    
    return UserModel.findOne(query, function (error, user) {
	
	if(error){
	    return res.send(error, 500);
	}
	
	user.save(function (error) {
	    if (error) {
		return res.send(error);
	    }else{
		return res.send(user);
	    }
	});
    });

});


/**
 * Fetch current user
 */
router.get('', function(req, res) {
    var identity = new Identity(req.session);
    var query = {'_id':identity.getUserId(), 'AccountId' : identity.getAccountId()};
    
    return UserModel.findOne(query, function (error, user) {
	
	if(error){
	    return res.send(error, 500);
	}
	
	return res.send(user);
    });
})


// export module
module.exports = router;

