/**
 * Express framework
 */
var express = require('express');

/**
 * Path builtin module
 */
var path = require('path');

/**
 * Favicon, middleware for serving a favicon 
 */
var favicon = require('serve-favicon');

/**
 * HTTP request logger middleware
 */
var logger = require('morgan');

/**
 * Cookeie parser, for sessions
 */
var cookieParser = require('cookie-parser');

/**
 * Express, body parsing middleware.
 */
var bodyParser = require('body-parser');

/**
 * Multer, middleware for handling multipart/form-data, which is primarily used for uploading files
 */
var multer  = require('multer');

/**
 * Express session middleware
 */
var session = require('express-session');

/**
 * MongoDB object modeling designed to work in an asynchronous environment.
 */
var mongoose = require('mongoose');

/**
 * MongoDB session store
 */
var MongoStore = require('connect-mongo')(session);

/**
 * Load configuration defined in env
 */
var config_file = process.env.CONFIG;
var config = require('./' + config_file);

/**
 * Load application routes
 */

/**
 * Web view routes
 */
var routes = require('./routes/index');

/**
 * Users api
 */
var users = require('./routes/users');

/**
 * Auth api
 */
var auth = require('./routes/auth');

/**
 * Print route
 */
var print = require('./routes/print');

/**
 * Notifications api
 */
var notifications =  require('./routes/notifications');

/**
 * Internships api
 */
var internships =  require('./routes/internships');

/**
 * Forms templates api
 */
var formTemplates =  require('./routes/formtemplates')

/**
 * User account api
 */
var myApi = require('./routes/my');

/**
 * File upload and management
 */
var fileApi = require('./routes/file');

/**
 * Student checkin api
 */
var checkinApi = require('./routes/checkin');

/**
 * Form data api
 */
var formApi = require('./routes/form');


/**
 * Connect to MongoDb
 */
mongoose.connect(config.mongodb);

// bootstrap application
var app = express();

// attach file storage middleware
app.use(multer(config.storage));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// attach favicon middleware
app.use(favicon(__dirname + '/public/favicon.ico'));

// attach logging middleware
app.use(logger('dev'));

// attach body parser middleware for json input
app.use(bodyParser.json());

// attach body parser middleware for urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// attach cookie parser
app.use(cookieParser());

// attach static files server 
app.use(express.static(path.join(__dirname, 'public')));

// setup sessions 
var session_config = config.session;
session_config.store = new MongoStore({ mongooseConnection: mongoose.connection });
app.use(session(session_config));

/**
 * Attach routes
 */

// web views
app.use('/', routes);

// print routes
app.use('/print', print);

/**
 * APIs
 */

// users api
app.use('/api/users', users);

// auth api
app.use('/auth', auth);

// notifications api
app.use('/notifications', notifications);

// internships api
app.use('/api/internships', internships);

// forms api
app.use('/api/forms', formTemplates);

// user account api
app.use('/api/my', myApi);

// files api
app.use('/api/files', fileApi);

// checkin api
app.use('/api/checkin', checkinApi);

// form data api
app.use('/api/forms_data', formApi);

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
