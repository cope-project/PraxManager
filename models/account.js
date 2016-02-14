/**
 * Account Model
 */

// load mongoose 
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define account schema
 */
var AccountSchema = new Schema({
	'InstitutionName': { type: String, required: true },
	'CreateDate': Date,
	'UpdateDate': Date
});

/**
 * Add update date on save
 */
AccountSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// create model
var AccountModel = mongoose.model('Account', AccountSchema);

// export module
module.exports = AccountModel;