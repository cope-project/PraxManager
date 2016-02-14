/**
 * Internet Media Formats
 */

// define mime types
var InternetMediaTypes = {
	'image': ['image/gif', 'image/jpeg', 'image/pjpeg', 
	          'image/png', 'image/bmp', 'image/tiff'],
	          
	'audio': ['audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/flac',
	           'audio/opus', 'audio/vorbis', 'audio/vnd.rn-realaudio',
	           'audio/vnd.wave', 'audio/webm', 'audio/mp3', 'audio/aac', 
			   'audio/aacp', 'audio/3gpp', 'audio/vnd.dlna.adts'],
	           
	'video': ['video/avi', 'video/mpeg', 'video/mp4', 'video/ogg',
	           'video/quicktime', 'video/webm', 'video/x-matroska',
	           'video/x-ms-wmv', 'video/x-flv'],
	           
	 'document': ['application/pdf', 'application/vnd.oasis.opendocument.text',
	              'application/vnd.oasis.opendocument.spreadsheet', 
	              'application/vnd.oasis.opendocument.presentation',
	              'application/vnd.oasis.opendocument.graphics',
	              'application/vnd.ms-excel',
	              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	              'application/vnd.ms-powerpoint',
	              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	              'application/vnd.ms-xpsdocument'
	              ]
};


/**
 * Returns the category of the mime type
 */
function mimeCategory(mime){
    for(var index in Object.keys(InternetMediaTypes)){
	var category = Object.keys(InternetMediaTypes)[index];
	if(InternetMediaTypes[category].indexOf(mime) != -1){
	    return category;
	}
    }
    
    return null;
}

// export module
module.exports = {
	'InternetMediaTypes': InternetMediaTypes,
	'mimeCategory': mimeCategory
};
