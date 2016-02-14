/**
 * Password hash function
 */

// load crypto
var crypto = require('crypto');


/**
 * Hash string using sha1
 */
function hash_password(string){
	
	if(string == undefined){ return undefined;}
	
	var shasum = crypto.createHash('sha1');
	shasum.update(string);
	return shasum.digest('hex');
}

/**
 * Generate random string
 */
function random (howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}

/**
 * Generate random string for password
 */
function random_password(){
    return random(10);
};


// export module
module.exports = {hash: hash_password, 'random': random_password, '_random': random};