/**
 * File model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define file schema
 */
var FileSchema = new Schema({
	'AccountId': {type: Schema.Types.ObjectId,  required: true},
	'OwnerId': {type: Schema.Types.ObjectId,  required: true},
	'Type': {type: String, required:true, enum: ['video', 'audio', 'image', 'document']},
	'FileName':{type: String, required: true},
	'StorageFileName': {type: String, required: true},
	"FileMetadata": {type: Object, required: true},
	'CreateDate': {type: Date, 'default': Date.now},
	'UpdateDate': {type: Date, 'default': Date.now},
});

/**
 * Update update date on save
 */
FileSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// create model
var FileModel= mongoose.model('File', FileSchema);

// export module
module.exports = FileModel;
