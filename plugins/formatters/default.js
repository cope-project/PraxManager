/**
 * Default print formatter
 */

/**
 * Format a single form to mime type
 */
function format(internship, student, forms, callback) {
    return callback('html');
}

module.exports = {
    format: format,
    name: 'Default Format',
    id: 'default'
};