var Q = require('q');
var util = require('util');
var config = require('../config');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var tvdb = new (require("node-tvdb"))("6E61D6699D0B1CB0");
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

function doRename(item, destinationDir) {
	var rmdir = Q.denodeify(require('rimraf'));
	var mkdir = Q.denodeify(require('mkdirp'));
	var rename = Q.denodeify(fs.rename);
		
	var promise = 
		mkdir(destinationDir)
		.then(function() {
			return rename(item.downloadDir, destinationDir).fail(function(error) {
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
			item.state = ItemStates.renamed;
			return item.save();		
		});
			
	return promise;
}

function rename(item) {
	util.log("Renaming " + item.name);		
	
	var itemName = item.name;
	var promise;
	
	if (item.type === ItemTypes.show && item.externalId) {
		promise = getShowNameAndRename(item);
	} else {
		promise = renameTo(item, item.name);
	}
	
	promise.catch(function(error) {
		util.error(error);
		item.stateInfo = error.message || error;
		item.state = ItemStates.renameFailed;
		item.save();		
	});
}

function renameTo(item, itemName) {
	var destinationDir = path.join(config[item.type + 'TargetDir'], itemName);

	if (item.type === ItemTypes.show)
		destinationDir = path.join(destinationDir, 'Season ' + item.no);

	return doRename(item, destinationDir);
}

function getShowNameAndRename(item) {
	return Q.nbind(tvdb.getSeriesByRemoteId, tvdb)(item.externalId).then(function(response) {
		var itemName = item.name;
	
		if (response.SeriesName) {
			itemName = response.SeriesName;
		} else if (response[0] && response[0].SeriesName) {
			itemName = response[0].SeriesName;
		}

	    return renameTo(item, itemName);
	});
}

module.exports.rename = rename;
