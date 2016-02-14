/**
 * Default print formatter
 */

/**
 * Format a single form to mime type
 */
function default_formatter(form, student) {
    return 'html';
}

/**
 * Format multiple a range of forms form multiple days 
 * to mime type
 * @param forms []
 * @param student {}
 * @returns {String}
 */
function default_formatter_multiday(forms, student){
    return 'multiday html';
}

function default_metadata(){
    return {
	'single': true, // this plugin has support for a single form
	'multiday': true, // this plugin has support form multiday aggregation
	'mime': 'text/html'
    };
}

module.exports = {
	'format': default_formatter,
	'format_multiday': default_formatter_multiday,
	'metadata': default_metadata
	};