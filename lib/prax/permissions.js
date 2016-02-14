/**
 * This module will check user permissions
 */


/**
 * Users permissions class
 */
function UserPermissions(permissions) {
    this.permissions = permissions;
}

/**
 * Check student permissions for the current request
 */
UserPermissions.prototype.checkStudentPermissions = function (req, callback) {
    var permissions = this.permissions.student;
    var pass = checkPermissions(permissions, req);
    return callback(pass);
};


/**
 * Check teacher permissions for the current request
 */
UserPermissions.prototype.checkTeacherPermissions = function (req, callback) {
    var permissions = this.permissions.teacher;
    
    // the teacher also has student permissions
    var student_permissions = this.permissions.student;
    
    var pass = checkPermissions(permissions, req);
    
    if(!pass){
        pass = checkPermissions(student_permissions, req);
    }
    
    return callback(pass);
};


/**
 * Generic permissions check function
 */
function checkPermissions(permissions, req) {
    var passing = false;
    var paths = Object.keys(permissions.allowed_paths);

    paths.forEach(function (value, index) {
        var re = new RegExp(value);
        var access = permissions.allowed_paths[value];
        if (re.test(req.path) && access.indexOf(req.method) !== -1) {
            passing = true;
        }
    });

    return passing;
}



// export module
module.exports = {
    'UserPermissions': UserPermissions
};