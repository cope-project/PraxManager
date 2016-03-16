/**
 * Form template model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define form template schema
 */
var FormTemplateSchema = new Schema({
	'AccountId': {type: Schema.Types.ObjectId,  required: true},
	'Name': {type:String, required:true},
	'Category': {type:String, 'default': 'General'},
	'Description': {type:String, 'default': ''},
	'Questions': {type:Array, 'default':[]},
	'QuestionsCount': {type:Number, 'default':0},
	'Interval': {type:String, 'default':'daily', enum: ['daily', 'once']},
	'Intervals': {type:Array, 'default': [{text: 'Once', value: 'Once'}]}, 
	'Type': {type:String, 'default':'optional', enum: ['optional', 'required']},
	'CompletedBy': {type:String, 'default':'student', enum: ['student', 'teacher', 'student_and_teacher']},
	'Status': {type:String, 'default':'active',enum: ['active', 'deleted']},
	'CreateDate': {type: Date, 'default': Date.now},
	'UpdateDate': {type: Date, 'default': Date.now}
});

/**
 * Update update date on save
 */
FormTemplateSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// create model from schema
var FormTemplateModel = mongoose.model('FormTemplate', FormTemplateSchema);

// export module
module.exports = FormTemplateModel;