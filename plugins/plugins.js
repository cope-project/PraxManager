"use strict";
/**
 * Index all plugins in this file
 */

// load default formatter plugin
let default_formatter = require('./formatters/default');

// load tasks formatter plugin
let tasks_formatter = require('./formatters/tasks');


/**
 * Export api
 */
module.exports = {
    getFormatPlugins: _ => [default_formatter, tasks_formatter]
};