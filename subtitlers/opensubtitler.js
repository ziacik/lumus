var Q = require('q');
var util = require('util');
var config = require('../config');

var openSubtitles = require('opensubtitles-client');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

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
	var searchFunction;
	
	if (item.type === ItemTypes.movie) {
		searchFunction = openSubtitles.api.searchForFileAndTag.bind(openSubtitles.api);
	} else {
		searchFunction = openSubtitles.api.searchForFile.bind(openSubtitles.api);
	}	
	
	searchFunction(token, config.subtitleLanguages, filePath)
	.then(function(results) {
		if (results && results.length) {
			openSubtitles.downloader.download(results, 1, filePath, function() {
				deferred.resolve(true);
			});
		} else {
			deferred.resolve(false);
		}
	}).catch(function(error) {
		deferred.reject(error);
	});
	
	return deferred.promise;
}

module.exports.hasSubtitlesForName = function(name) {
	var token;
	
	return openSubtitles.api.login()
	.then(function(tok) {
		token = tok;
		return openSubtitles.api.searchAny(token, config.subtitleLanguages, { tag : name });
	}).then(function(results) {
		openSubtitles.api.logout(token).done();
		return results && results.length;
	});
};