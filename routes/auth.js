/**
 * Auth routes
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load user identity interface
var Identity = require('./../lib/identity');

// load moodle auth adapter
var MoodleAdapter = require('./../lib/moodle/auth');

// load passwordlib used for hashing
var passwordlib = require('./../lib/password');

// load user model
var UserModel = require('./../models/user');

// load account model
var AccountModel = require('./../models/account');

// load emailer, email sending library
var emailer = require('./../lib/emailer');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../' + config_file)

// load language library
var lang = require('./../lib/lang');



/**
 * Public login page
 */
router.get('/login', function (req, res) {
    res.render('login', { title: 'Login', 'lang': lang });
});


/**
 * Perform login api call
 */
router.post('/login', function (req, res) {
    var identity = new Identity(req.session);
    var _ = lang._('login');

    var email = req.body.email.trim();
    var password = req.body.password.trim();

    var login_success = false;
    UserModel.findOne({ Email: email, Password: passwordlib.hash(password) }, function (error, user) {
        if (error) {
            return res.send({ logedin: false }, 500);
        }

        if (user != null) {
            AccountModel.findById(user.AccountId, function (error, account) {
                if (!error) {
                    identity.login(account, user);
                    return res.send({ logedin: true, type: user.Type });
                } else {
                    return res.send({ logedin: false });
                }
            })

        } else {

            if (config.moodle.enable == false) {
                return res.send({ logedin: false });
            }

            var adapter = new MoodleAdapter();
            adapter.login({ 'email': email, 'password': password }, function (error, user, account) {
                if (error) {
                    return res.send({ logedin: false });
                }
                var message = _("Thank you for your registration! Your account is now ready to use.") + "\PraxManager: http://" + config.domain;
                var e = user.FirstName + '' + user.LastName + ' <' + user.Email + '>';
                emailer.sendNotificationEmail("PraxManager -" + _("Account successfully created"), message, e, function (error) {
                    identity.login(account, user);
                    return res.send({ logedin: true, type: user.Type });
                });

            });

        }

    })
});

/**
 * Reset password page
 */
router.get('/reset_password', function (req, res) {
    if (!req.query.token) {
        return res.redirect('/auth/login');
    }
    
    var _ = lang._('reset_password');

    var token = req.query.token;
    UserModel.findOne({ ResetPasswordToken: token }, function (error, user) {

        if (error) {
            return res.redirect('/auth/login');
        }

        if (user == null) {
            return res.redirect('/auth/login');
        }

        var password = passwordlib.random();
        var password_hash = passwordlib.hash(password);

        user.Password = password_hash;
        user.ResetPasswordToken = null;
        user.save(function (error, user) {
            if (error) {
                return res.redirect('/auth/login');
            }

            var message = _("Your new password is: ") + password;
            var e = user.FirstName + '' + user.LastName + ' <' + user.Email + '>';
            var subject = 'PraxManager - ' + _("New password");

            emailer.sendNotificationEmail(subject, message, e, function (error, info) {
                if (error) {
                    return res.redirect('/auth/login');
                } else {
                    res.render('reset_password', { title: _('Reset password'), 'lang': lang});
                }
            });
        });
    });
});

/**
 * Reset password api call
 */
router.post('/reset_password', function (req, res) {
    var identity = new Identity(req.session);
    var email = req.body.email;
    var _ = lang._('reset_password');
    
    UserModel.findOne({ Email: email }, function (error, user) {

        if (error) {
            return res.send({ password_reseted: false }, 500);
        }

        if (user == null) {
            return res.send({ password_reseted: false }, 404);
        } else {
            var token = passwordlib._random(64);
            user.ResetPasswordToken = token;
            user.save(function (error, saved_user) {

                if (error) {
                    return res.send({ password_reseted: false }, 500);
                }

                var message = _("Click the link below to reset your account password:") + '<br>';
                var url = 'http://' + config.domain + '/auth/reset_password?token=' + token;
                message += '<a href="' + url + '">' + url + '</a>';
                var e = user.FirstName + '' + user.LastName + ' <' + user.Email + '>';
                var subject = "PraxManager - " + _('Reset password');

                emailer.sendNotificationEmail(subject, message, e, function (error, info) {
                    if (error) {
                        return res.send({ password_reseted: false }, 500);
                    } else {
                        return res.send({ password_reseted: true }, 200);
                    }
                });
            });
        }

    })
});


/**
 * Logout page
 */
router.get('/logout', function (req, res) {
    var identity = new Identity(req.session);
    identity.logout();
    return res.redirect('/auth/login');
});

/**
 * Current user data api call
 */
router.get('/current', function (req, res) {
    var identity = new Identity(req.session);

    if (identity.isAuth()) {
        var user = identity.getUser()
        delete user.Password
        res.send(user)
    } else {
        res.send({}, 400)
    }
})


// expxort module
module.exports = router;

