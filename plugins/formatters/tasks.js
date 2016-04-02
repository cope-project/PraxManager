/**
 * Format questions as a list of tasks
 */
var jade = require('jade');

function format(internship, student, forms, callback) {
    var fn = jade.compileFile('views/plugins/formaters/tasks.jade');
    
    return callback(fn({}));
}

module.exports = {
    format: format,
    name: 'Task List Format',
    id: 'tasks'
};