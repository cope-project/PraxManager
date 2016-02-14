/**
 * Internship model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define internship schema
 */
var InternshipSchema = new Schema({
	'AccountId': {type: Schema.Types.ObjectId,  required: true},
	'Name': {type: String, required: 'Internship name is required'},
	'StartDate':{type: Date, required: true},
	'EndDate': {type: Date, required: true},
	'AssignedUsers': {type: Array, 'default': []},
	'AssignedForms': {type: Array, 'default': []},
	'AssignedAdministrators': {type: Array, 'default': []},
	'Description': {type:String, 'default':''},
	'Institution': {type:String, 'default':''},
	'Location': {type:String, 'default':''},
	'CompletionLimit': {type:String, 'default':'last7days', enum: ['last3days','last7days', 'last30days']},
	'ColectDataType': {type:String, 'default':'day', enum: ['day', 'time']},
	'Status': {type:String, 'default':'active', enum: ['active', 'pending', 'archived', 'deleted']},
	'CreateDate': {type: Date, 'default': Date.now},
	'UpdateDate': {type: Date, 'default': Date.now}
});

/**
 * Update update date on save
 */
InternshipSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// create internship model from schema
var InternshipModel = mongoose.model('Internship', InternshipSchema);

// export module
module.exports = InternshipModel;