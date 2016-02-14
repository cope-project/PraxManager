/**
 * Form Model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define form schema 
 */
var FormSchema = new Schema({
	'AccountId': { type: Schema.Types.ObjectId, required: true },
	'UserId': { type: Schema.Types.ObjectId, required: true },
	'FormTemplateId': { type: Schema.Types.ObjectId, required: true },
	'InternshipId': { type: Schema.Types.ObjectId, required: true },
	'FormData': { type: Object, required: true },
	'ReviewFormData': { type: Object, 'default': null },
	'Date': { type: Date, required: true },
	'CompletedBy': { type: String, 'default': 'student', enum: ['student', 'teacher'] },
	'TeacherId': { type: Schema.Types.ObjectId },
	'CreateDate': { type: Date, 'default': Date.now },
	'UpdateDate': { type: Date, 'default': Date.now }
});

/**
 * Update update date on save
 */
FormSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// create modal form schema
var FormModel = mongoose.model('Form', FormSchema);

// export module
module.exports = FormModel;