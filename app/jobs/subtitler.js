var config = require('../config');
var labels = require('../labels');
var util = require('util');
var Promise = require('bluebird');
var readdir = Promise.promisify(require('fs').readdir);
var path = require('path');

config.add('subtitler', { type : 'literal', store : {'subtitler:languages' : 'eng', 'subtitler:shouldSearchByName' : true}});
labels.add({
	subtitler : '<span class="fa fa-file-text" /> Subtitling',
	languages : 'Subtitle Languages <small><em>Use comma to separate multiple languages</em></small>',
	shouldSearchByName : 'Search By File Name <small><em>if nothing found with exact match</em></small>'
});

module.exports = (require('./serviceDispatcher')).create();

function setSubtitlerFail(item, why) {
	item.subtitlerFailCount = 1 + (item.subtitlerFailCount || 0);
	return item.setInfo(why).rescheduleNextDay();
}

function setSubtitlerSuccess(item) {
	return item.setState('Finished').saveAndPublish();
}

function getPathsForSubtitling(item) {
	var extPattern = /[.](avi|mkv|mp4|mpeg4|mpg4|mpg|mpeg|divx|xvid)$/i;

	return readdir(item.renamedDir).then(function(files) {
		var relevantFiles = files.filter(function(file) {
			return extPattern.test(file);
		});

		var relevantPaths = relevantFiles.map(function(file) {
			return path.join(item.renamedDir, file);
		});

		return relevantPaths;
	});
}

module.exports.listSubtitles = function(item) {
	return this.untilSuccess(function(service) {
		return service.listSubtitles(item);
	});
};

module.exports.findSubtitles =  function(item) {
	var self = this;
	var completeness = 0;
	var pathCount = 0;

	return getPathsForSubtitling(item)
	.then(function(paths) {
		pathCount = paths.length;

		if (paths.length == 0) {
			return false;
		}

		return self.untilSuccess(function(service) {
			return service.findSubtitles(item, paths);
		}, function isSuccess(results) {
			var isSuccess = true;

			for (var i = results.length - 1; i >= 0; i--) {
				if (results[i]) {
					paths.splice(i, 1);
					completeness++;
				} else {
					isSuccess = false;
				}
			}

			return isSuccess;
		});
	}).then(function(overallResult) {
		if (overallResult) {
			return setSubtitlerSuccess(item);
		} else {
			return setSubtitlerFail(item, completeness + " of " + pathCount + ' subtitles found');
		}
	});
};
