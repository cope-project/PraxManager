/**
 * Moodle auth adapter
 */

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../../' + config_file);

var passwordlib = require('./../../lib/password');
var AccountModel = require('./../../models/account');
var UserModel = require('./../../models/user');

/**
 * credentials = {email: '', password: ''}
 */
function AuthAdapter () {
    
    this.login = function (credentials, callback) {
	var connection = mysql.createConnection(config.moodle.database);
	connection.connect();
	
	var sql = 'select id,firstname,lastname,email,password from ' + config.moodle.database.prefix;
	sql += "user where auth = 'manual' and email = ? and confirmed = 1 and deleted = 0 and suspended = 0";
	var query = {
	    'sql': sql,
	    'values': [credentials.email]
	  };
	connection.query(query, function(err, rows, fields) {
	    if (err) throw err;
	    if (rows.length != 1){
		return callback(new Error('User not found'), null, null);
	    }
	    
	    var user = rows[0];
	    connection.end();
	    
	    user.password = user.password.replace(/^\$2y(.+)$/i, '\$2a$1');
	    if(!bcrypt.compareSync(credentials.password, user.password)){
		return callback(new Error('Invalid password'), null, null);
	    }
	    
	    createUserFormMoodle(user, credentials.password, function (error, user, account){
		if(error){
		    return callback(error, null, null);
		}
		
		return callback(null, user, account);
	    });
	  });
    };
}

function createUserFormMoodle(user, password, callback){
    
    AccountModel.findById(config.moodle.account, function (error, account){
	 if (error) callback(error, null, null);
	 
	 var newUser = new UserModel({
		'FirstName': user.firstname,
		'LastName': user.lastname,
		'Email': user.email,
		'AccountId':account._id,
		'Password': passwordlib.hash(password),
		'Type': 'student',
		'Meta': {'moodle': {'user_id': user.id}},
		'MoodleAccount': true
	});
	 
	newUser.save(function (error, user) {
	    if (error){
		callback(error, null, null);
	    }else{
		callback(null, user, account);
	    }
	});
    });

}


module.exports = AuthAdapter;