var Q = require('q');
var util = require('util');
var config = require('../config');

var openSubtitles = require('opensubtitles-client');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

module.exports.name = 'OpenSubtitles.org';

module.exports.findSubtitles = function(item, filePaths) {
	var deferred = Q.defer();
	
	openSubtitles.api.login()
	.done(function(token) {

		var promises = filePaths.map(function(filePath) {
			return Q.fcall(findSubtitlesOne, token, item, filePath);
		});

		Q.allSettled(promises).then(function(results) {
			openSubtitles.api.logout(token);
			deferred.resolve(results);
		}).catch(function(error) {
			deferred.reject(error);
		});
	}).fail(function(error) {
		deferred.reject(error);
	});
	
	return deferred.promise;
};

function findSubtitlesOne(token, item, filePath) {
	var deferred = Q.defer();

	openSubtitles.api.searchForFile(token, config.subtitleLanguages, filePath)
	.done(function(results) {
		if (results && results.length) {
			openSubtitles.downloader.download(results, 1, filePath, function() {
				deferred.resolve(true);
			});
		} else {
			deferred.resolve(false);
		}
	}).fail(function(error) {
		deferred.reject(error);
	});
	
	return deferred.promise;
}