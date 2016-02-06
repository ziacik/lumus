var Q = require('q');
var util = require('util');
var path = require('path');
var config = require('../config');
var labels = require('../labels');

var openSubtitles = require('opensubtitles-client');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

config.add('opensubtitler', { type : 'literal', store : {'subtitler:opensubtitler:use' : true}});
labels.add({ opensubtitler : 'OpenSubtitles.org' });

module.exports.name = 'OpenSubtitles.org';

module.exports.findSubtitles = function(item, filePaths) {
	return openSubtitles.api.login()
	.then(function(token) {

		var promises = filePaths.map(function(filePath) {
			return Q.fcall(findSubtitlesOne, token, item, filePath);
		});

		return Q.all(promises).then(function(results) {
			openSubtitles.api.logout(token).done();
			return results;
		});
	});
};

function findSubtitlesOne(token, item, filePath) {
	var deferred = Q.defer();
	
	openSubtitles.api.searchForFile(token, config.get().subtitler.languages, filePath)
	.then(function(results) {
		if (results && results.length) {
			return results;
		} else if (config.get().subtitler.shouldSearchByName) {
			var fileName = path.basename(filePath);
			return openSubtitles.api.searchForTag(token, config.get().subtitler.languages, fileName);
		}
	}).then(function(results) {
		if (results && results.length) {
			var downloaderDomain = require('domain').create()
			downloaderDomain.on('error', function(err){
				console.error('Subtlter download error.', err.stack || err.message);
				deferred.reject(err);
			});

			downloaderDomain.run(function() {
				openSubtitles.downloader.download(results, 1, filePath, function() {
					deferred.resolve(true);
				});
			});
		} else {
			deferred.resolve(false);
		}
	}).catch(function(error) {
		deferred.reject(error);
	});
	
	return deferred.promise;
}

module.exports.listSubtitles = function(item) {
	var token;
	var imdbId = parseInt(item.externalId.replace('tt', ''));
	
	return openSubtitles.api.login()
	.then(function(tok) {
		token = tok;		
		return openSubtitles.api.search(token, config.get().subtitler.languages, { imdbid : imdbId });
	}).then(function(results) {
		openSubtitles.api.logout(token).done();
		return results;
	}).catch(function(error) {
		var newError = new Error('Error listing subtitles');
		newError.causedBy = error;
		throw newError; 
	});
};
