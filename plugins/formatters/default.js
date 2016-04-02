/**
 * Default print formatter
 */

/**
 * Format a single form to mime type
 */
function format(internship, student, forms, callback, lang) {
    var _ = lang._('plugins.formatters.default');
    return callback(_('This form is not avalable in print version.'));
}

module.exports = {
    format: format,
    name: 'Default Format',
    id: 'default'
};