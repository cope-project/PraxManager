/**
 * File API
 */

// load express and express router
var express = require('express');
var router = express.Router();

// load builtin filesystem api
var fs = require('fs');

// load file model
var FileModel = require('./../models/file');

// load user identity interface
var Identity = require('./../lib/identity');

// load mime library
var mimelib = require('./../lib/mime');

// load configuration
var config_file = process.env.CONFIG;
var config = require('./../' + config_file);

/**
 * Upload new file
 */
router.post('/', function (req, res) {
    if (req.files.upload_file == undefined) {
		return res.status(400).send({ 'Message': 'Upload file not sent' })
    }

    var file = req.files.upload_file;

    var type = mimelib.mimeCategory(file.mimetype);

    if (type == null) {
		// lots of undocumented mimetypes
		// return res.status(400).send({'Message': 'This content type is not allowed'});
		type = 'document';
    }
    
    // check header
    if (type != req.body.type) {
		// lots of undocumented mimetypes
		//return res.status(400).send({'Message': 'Content type not matching content type advertised'});
    }

    var identity = new Identity(req.session);

    var oFile = new FileModel({
		'AccountId': identity.getAccountId(),
		'OwnerId': identity.getUserId(),
		'Type': type,
		'FileName': file.originalname,
		'StorageFileName': file.name,
		'FileMetadata': file
    });

    oFile.save(function (error, savedFile) {
		if (error) {
			return res.status(500).send(error);
		}

		return res.status(201).send(savedFile);
    });

});

/**
 * Get file metadata
 */
router.get('/:id', function (req, res) {
    var identity = new Identity(req.session);
    var query = { '_id': req.params.id, 'AccountId': identity.getAccountId() };

    FileModel.findOne(query, function (error, file) {
		if (error) {
			return res.status(500).send(error);
		}

		return res.send(file);
    });
});

/**
 * Fetch file data
 */
router.get('/:id/data', function (req, res) {
    var identity = new Identity(req.session);
    var query = { '_id': req.params.id, 'AccountId': identity.getAccountId() };

    FileModel.findOne(query, function (error, file) {
		if (error) {
			return res.status(500).send(error);
		}

		res.setHeader('Content-disposition', 'attachment; filename=' + file.FileName);
		res.setHeader('Content-type', file.FileMetadata.mimetype);

		var filePath = config.storage.dest + '/' + file.StorageFileName;
		if (fs.existsSync(filePath)) {
			var filestream = fs.createReadStream(filePath);
			filestream.pipe(res);
		} else {
			return res.status(404).send(new Error('File not found'));
		}

    });
});

// export module
module.exports = router;