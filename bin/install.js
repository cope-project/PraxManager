#!/usr/bin/env node
/**
 * Install application script
 */

// load config
var config_file = process.env.CONFIG;
var config = require('./../' + config_file);

// load mongoose
var mongoose = require('mongoose');

// load passwordlib
var passwordlib = require('./../lib/password');

// load account and user model
var AccountModel = require('./../models/account');
var UserModel = require('./../models/user');

// connect to mongodb
mongoose.connect(config.mongodb);

var account = new AccountModel({
    'InstitutionName': 'Default'
});

var ADMIN_EMAIL = 'admin@prax-manager.net';
var ADMIN_PASSWORD = 'default1';

var userdata = {
    'FirstName': 'Admin',
    'LastName': 'Admin',
    'Email': ADMIN_EMAIL,
    'Password': passwordlib.hash(ADMIN_PASSWORD),
    'Type': 'admin',
    'Meta': {}
};

/**
 * Save account
 */
function save_account(error, account){
    userdata.AccountId = account._id;
    var user = new UserModel(userdata);
    
    console.log('Create new user ...');
    console.log('Email: ' + ADMIN_EMAIL);
    console.log('Password: ' + ADMIN_PASSWORD)
    user.save(save_user);
}

/**
 * Save user
 */
function save_user(){
    console.log('Instalation completed');
    process.exit(0);
}

console.log('Start install process ...');

// check is instalation exists
UserModel.find({ 'Email': ADMIN_EMAIL }, function (err, users) {
    console.log('Search for existing instalation ... ');
    
    if(users.length === 0){
	console.log('No instalation found ...');
	console.log('Create new account ...');
	account.save(save_account);
    }else{
	console.log('Application is already installed ');
	process.exit(1);
    }
})





