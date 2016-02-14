/**
 * Message model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define message schema
 */
var MessageSchema = new Schema({
	'AccountId': {type: Schema.Types.ObjectId,  required: true},
	'UserId': {type: Schema.Types.ObjectId,  required: true},
	'From': {type: String, 'default': 'PraxManager'},
	'Message': {type:String, required: true},
	'Seen': {type:Boolean, 'default': false},
	'CreateDate': {type: Date, 'default': Date.now},
});

// create model form schema
var MessageModel = mongoose.model('Message', MessageSchema);


// export module
module.exports = MessageModel;