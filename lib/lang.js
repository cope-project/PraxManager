// load config
var config_file = process.env.CONFIG;
var config = require('./../' + config_file);

var default_language = 'en';
var language_pack = {};

// load language file
if(config.lang != default_language){
	language_pack = require('./../lang/' + config.lang + '.json');
}

// client side language files
var jsLanguagePacks = {
	'cz': 'angular-locale_cs-cz.js',
	'dk': 'angular-locale_da-dk.js',
	'es': 'angular-locale_es-es.js',
	'ro': 'angular-locale_ro-ro.js',
	'tk': 'angular-locale_en-tk.js',
	'ct': 'angular-locale_es-es.js',
	'en': 'angular-locale_en-gb.js'
};

/**
 * Load langage section
 */
function section (section) {
	if(config.lang == default_language){
		return function (message) { return message; };
	}
	
	var path = section.split('.');
	var current = language_pack;
	var error = false;
	
	path.forEach(function (value, index) {
		if(current[value]){
			current = current[value]
		}else{
			error = true;
		}
	});
	
	
	if(error){
		throw 'Section not found.';
	}
	
	/**
	 * Translate message using dictionary
	 */
	return function translate (message) {	
		if(current[message]){
			return current[message];
		}
		
		return message;
	}
}

// export module
module.exports = {'_':section, js: jsLanguagePacks[config.lang], 'id': config.lang};