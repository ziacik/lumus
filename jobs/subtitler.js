var config = require('../config');
var labels = require('../labels');
var util = require('util');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var ItemStates = require('../models/item').ItemStates;

config.add('subtitler', { type : 'literal', store : {'subtitler:languages' : 'eng', 'subtitler:shouldSearchByName' : true}});
labels.add({
	subtitler : '<span class="fa fa-file-text" /> Subtitling',
	languages : 'Subtitle Languages <small><em>Use comma to separate multiple languages</em></small>',
	shouldSearchByName : 'Search By File Name <small><em>if nothing found with exact match</em></small>'
});

module.exports = new (require('./serviceDispatcher').ServiceDispatcher)();

function setSubtitlerFail(item, why) {
	item.state = ItemStates.subtitlerFailed;
	item.stateInfo = why;
	item.subtitlerFailCount = 1 + (item.subtitlerFailCount || 0);
	item.rescheduleNextDay();
}

function setSubtitlerSuccess(item) {
	item.state = ItemStates.subtitled;
	delete item.stateInfo;
	item.save();
}

function getPathsForSubtitling(item) {
	var readdir = Q.denodeify(fs.readdir);
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
			setSubtitlerSuccess(item);
		} else {
			setSubtitlerFail(item, completeness + " of " + pathCount + ' subtitles found');
		}
	}).catch(function(error) {
		util.error(error.stack || error);
		item.stateInfo = error.message || error;
		item.rescheduleNextHour();
	});
};