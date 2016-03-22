var Promise = require('bluebird');
var config = require('../config');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var tvdb = Promise.promisifyAll(new(require("node-tvdb"))("6E61D6699D0B1CB0"));

module.exports.rename = function(item) {
	console.log("Renaming " + item.name);

	if (item.type === 'Season' && item.imdbId) {
		return getShowNameAndRename(item);
	} else {
		return renameTo(item, item.name);
	}
}

function doRename(item, destinationDir) {
	var rmdir = Promise.promisify(require('rimraf'));
	var mkdir = Promise.promisify(require('mkdirp'));
	var rename = Promise.promisify(fs.rename);

	return mkdir(destinationDir).then(function() {
		return rename(item.downloadDir, destinationDir).catch(function(error) {
			if (error.code === 'ENOTEMPTY') {
				return rmdir(destinationDir).then(function() {
					return rename(item.downloadDir, destinationDir);
				});
			} else {
				throw error;
			}
		});
	}).then(function() {
		item.renamedDir = destinationDir;
		return item.setState('UpdatingLibrary').saveAndPublish();
	});
}

function renameTo(item, itemName) {
	console.log(item.type, item.getSettingsKey());
	var destinationDir = path.join(config.get()[item.getSettingsKey()].destinationDir, itemName);

	if (item.type === 'Season') {
		destinationDir = path.join(destinationDir, 'Season ' + item.no);
	}

	return doRename(item, destinationDir);
}

function getShowNameAndRename(item) {
	return tvdb.getSeriesByRemoteId(item.imdbId).then(function(response) {
		var itemName = item.name;

		if (response.SeriesName) {
			itemName = response.SeriesName;
		} else if (response[0] && response[0].SeriesName) {
			itemName = response[0].SeriesName;
		}

		return renameTo(item, itemName);
	});
}
