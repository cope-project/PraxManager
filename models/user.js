/**
 * User model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// load unique validator
var uniqueValidator = require('mongoose-unique-validator');

/**
 * Define user schema
 */
var UserSchema = new Schema({
	'FirstName': {type: String, required: true},
	'LastName': {type: String, required: true},
	'AccountId': {type: Schema.Types.ObjectId, required: true},
	'Email': {type: String,  unique: true, required: true},
	'Password':{type: String, required: true},
	'ResetPasswordToken': {type: String},
	'Type':  {type: String, required: true, enum: ['admin', 'teacher', 'student']},
	'MoodleAccount': {type: String, 'default': false},
	'Meta': {type: Object, 'default': {}},
	'Tag':{type: String, 'default': ''},
	'Status':{type: String, 'default': 'active', enum: ['active', 'deleted']},
	'CreateDate': {type: Date, 'default': Date.now},
	'UpdateDate': {type: Date, 'default': Date.now},
});


/**
 * Update update date on save
 */
UserSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// register unique validator plugin
UserSchema.plugin(uniqueValidator);

// create user model
var UserModel = mongoose.model('User', UserSchema);

/**
 * Validate email address
 */
UserModel.schema.path('Email').validate(function (value) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(value);
});


// export module
module.exports = UserModel;

