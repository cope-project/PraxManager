/**
 * Application routes
 * In this file all view web pages are defined
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load user indentity interface
var Identity = require('./../lib/identity');

// load language translation library
var lang = require('./../lib/lang');

// load permissions configuration
var permissions = require('./../permissions.json')

// load permissions lib
var permissionslib = require('./../lib/prax/permissions');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../' + config_file);

// load plugins
var plugins = require('./../plugins/plugins.js');


/**
 * Check user permissions
 */
router.use(function(req, res, next) {
    
    var identity = new Identity(req.session);
    var public_routes = ['/auth/login', '/auth/reset_password', '/reset_password'];
    
    // check public routes
    if(public_routes.indexOf(req.path) !== -1){
	   return next();
    }
    
    // this function will be called on access error
    var access_error = function (redirect_path) {
        if(/^\/api/.test(req.path)){
            return res.send({'message': 'Access Forbidden'}, 403);
        }else{
            return res.redirect(redirect_path);
        }
    }
    
    // check if the user is auth
    if(!identity.isAuth()){
	   return access_error('/auth/login');
    }
    
    var userPermissions = new permissionslib.UserPermissions(permissions);
    
    // check user type student permissions
    if(identity.getUser().Type == 'student'){
        return userPermissions.checkStudentPermissions(req, function (passing) {
            if(!passing){
                return access_error('/student');
            }
            return next(); 
        });
    }
    
    // check user type teacher permissions
    if(identity.getUser().Type == 'teacher'){
        return userPermissions.checkTeacherPermissions(req, function (passing) {
            if(!passing){
                return access_error('/internships');
            }
            return next(); 
        });
    }
    
    // check user type admin permissions
    if(identity.getUser().Type == 'admin'){
        return next(); 
    }

    return access_error('/auth/login');
});

/**
 * Home page
 */
router.get('/', function(req, res) {
    var identity = new Identity(req.session);
    
    return res.render('index', { 
        title: 'Home', 
        'identity' : identity, 
        'mod' : 'HomeController', 
        'lang': lang
    });
});


/**
 * User profile page
 */
router.get('/profile', function(req, res) {
  var identity = new Identity(req.session);
  var user = identity.getUser();
  
  var view = 'profile';
  if(user.Type == 'student'){
      view = 'student/profile';
  }
  
  return res.render(view, { 
      title: 'Edit Profile', 
      'identity' : identity, 
      'mod' : 'ProfileController' , 
      'lang': lang
      });
});

/**
 * User inbox
 */
router.get('/inbox', function(req, res) {
  var identity = new Identity(req.session);
  var user = identity.getUser();
  
  var view = 'inbox';
  if(user.Type == 'student'){
      view = 'student/inbox';
  }
  
    return res.render(view, { 
        title: 'Inbox', 
        'identity' : identity, 
        'mod' : 'InboxController', 
        'lang': lang
        });
});


/**
 * User settings
 */
router.get('/settings', function(req, res) {
  var identity = new Identity(req.session);
  var user = identity.getUser();
  
  var view = 'settings';
  if(user.Type == 'student'){
      view = 'student/settings';
  }
  return res.render(view, { 
      title: 'Settings', 
      'identity' : identity, 
      'mod' : 'SettingsController', 
      'lang': lang
      });
});


/**
 * Internships page
 */
router.get('/internships', function(req, res) {
  var identity = new Identity(req.session);
  return res.render('internships', { 
      title: 'Internships', 
      'identity' : identity, 
      'mod' : 'InternshipsController' , 
      'lang': lang
      });
});


/**
 * Forms page
 */
router.get('/forms', function(req, res) {
    var identity = new Identity(req.session);
    var _plugins = plugins.getFormatPlugins()
    .map(function (plugin) {
        return {name: plugin.name, id: plugin.id};
    });
    return res.render('forms', { 
      title: 'Forms', 
      'identity' : identity , 
      'mod' : 'FormsController', 
      'lang': lang,
      'categories': config.forms.categories,
      'plugins': JSON.stringify(_plugins)
      });
});

/**
 * Users page
 */
router.get('/users', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('users', { 
        title: 'Users', 
        'identity' : identity , 
        'mod' : 'UsersController', 
        'lang': lang
        });
});

/**
 * Export page
 */
router.get('/export', function(req, res) {
  var identity = new Identity(req.session);
  return res.render('export', {
      title: 'Export Forms', 
      'identity' : identity, 
      'mod' : 'ExportController' , 
      'lang': lang
      });
});

/**
 * Student home page
 */
router.get('/student', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('student', { 
        title: 'Student', 
        'identity' : identity, 
        'mod' : 'MyInternshipsController' , 
        'lang': lang});
});




/**
 * Student internship page
 */
router.get('/my_internship/:id', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('my_internship', { 
        title: 'My Internship', 
        'identity' : identity, 
        'mod' : 'MyInternshipController', 
        internshipId: req.params.id , 
        'lang': lang
        });
});

/**
 * Student internship summary
 */
router.get('/my_internship/:id/summary', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('my_internship_summary', { 
        title: 'Internship summary', 
        'identity' : identity, 
        'mod' : 'MyInternshipSummaryController', 
        internshipId: req.params.id , 
        'lang': lang
        });
});

/**
 * Internship results
 */
router.get('/internships/results/:id', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('internships/results', { 
        title: 'Internship students', 
        'identity' : identity, 
        'mod' : 'InternshipStudentsController', 
        internshipId: req.params.id , 
        'lang': lang
        });
});

/**
 * Internship register
 */
router.get('/internships/register/:id', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('internships/register', { 
        title: 'Internship register', 
        'identity' : identity, 
        'mod' : 'InternshipRegisterController', 
        internshipId: req.params.id , 
        'lang': lang
        });
});

/**
 * Internship student submited forms
 */
router.get('/internships/results/:id/student_forms/:student_id', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('internships/student_forms', { 
        title: 'Internship student forms', 
        'identity' : identity, 
        'mod' : 'InternshipStudentFormsController', 
        internshipId: req.params.id,
        studentId: req.params.student_id, 'lang': lang
        });
});

/**
 * Internship student presence 
 */
router.get('/internships/results/:id/student_presence/:student_id', function(req, res) {
    var identity = new Identity(req.session);
    return res.render('internships/student_presence', { 
        title: 'Internship student presence', 
        'identity' : identity, 
        'mod' : 'InternshipStudentPresenceController', 
        internshipId: req.params.id,
        studentId: req.params.student_id, 'lang': lang
        });
});

// export module
module.exports = router;
