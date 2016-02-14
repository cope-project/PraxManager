/**
 * Account Model
 */

// load mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define checkin schema
 */
var CheckinSchema = new Schema({
    'AccountId': { type: Schema.Types.ObjectId, required: true },
    'UserId': { type: Schema.Types.ObjectId, required: true },
    'InternshipId': { type: Schema.Types.ObjectId, required: true },
    'Date': { type: Date, required: true },
    'Type': { type: String, 'default': 'day', enum: ['day', 'time'] },
    'Time': { type: Number, 'default': 1 },
    'Comment': { type: String, 'default': '' },
    'MediaFileComment': { type: Object, 'default': null },
    'Status': { type: String, 'default': 'pending', enum: ['pending', 'approved', 'rejected', 'deleted'] },
    'RejectionComment': { type: String, 'default': '' },
    'CreateDate': { type: Date, 'default': Date.now },
    'UpdateDate': { type: Date, 'default': Date.now },
});


/**
 * Update update date on save
 */
CheckinSchema.pre('save', function (next) {
    this.UpdateDate = new Date();
    next();
});

// create model
var CheckinModel = mongoose.model('Checkin', CheckinSchema);

// export module
module.exports = CheckinModel;