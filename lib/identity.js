/**
 * User identity module
 */

// load gavatar library
var gavatar = require('gravatar');

/**
 * User identity interface
 * session - session object
 */
function Identity(session) {
    
    /**
     * Check is the current user is auth
     */
    this.isAuth = function () {
	return session.auth === true;
    };
    
    /**
     * Login user with account
     */
    this.login = function (account, user) {
	session.auth = true;
	session.account = account;
	session.user = user;
    };
    
    /**
     * Logout user
     */
    this.logout = function () {
	session.auth = false;
    };
    
    /**
     * Returns user full name
     */
    this.getUserDisplayName = function () {
	return session.user.FirstName + ' ' + session.user.LastName;
    }
    
    /**
     * Returns user avatar
     */
    this.getUserAvatarURL = function () {
	return gavatar.url(session.user.Email, {}, false);
    };
    
    /**
     * Returns user object
     */
    this.getUser = function () {
	return session.user
    }
    
    /**
     * Returns account id
     */
    this.getAccountId = function () {
	return session.account._id;
    };
    
    /**
     * Returns user id
     */
    this.getUserId = function () {
	return session.user._id;
    };
    
    /**
     * Set user object
     */
    this.setUser = function (user) {
	session.user = user;
    };
    
    /**
     * Set account
     */
    this.setAccount = function (account) {
	session.account = account;
    };
}

// export module
module.exports = Identity;