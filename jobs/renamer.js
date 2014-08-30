var config = require('../config');
var fs = require('fs');
var path = require('path');
var process = require('child_process');
var rmdir = require('rimraf');
var mkdirp = require('mkdirp');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

//TODO: moje lokalne transmission rpc vracia pri duplicate torrente aj id, malina nie

function doRename(item, destinationDir) {
	console.log('Going to rename ' + item.downloadDir + ' -> ' + destinationDir);
	console.log('Exists source : ' + fs.existsSync(item.downloadDir));
	console.log('Exists destination : ' + fs.existsSync(destinationDir));
	
	if (!fs.existsSync(destinationDir)) {
		mkdirp.sync(destinationDir);
	}

	//TODO Removing an existing directory should be configurable.
	rmdir(destinationDir, function(error) {
		if (error) {
			console.log(error);
			item.stateInfo = error;
			item.state = ItemStates.renameFailed;
			item.save(function(err) {}); //TODO: err handling
			return;	
		}
		
		fs.rename(item.downloadDir, destinationDir, function(error) {
			if (error) {
				console.log(error);
				item.stateInfo = error;
				item.state = ItemStates.renameFailed;
				item.save(function(err) {}); //TODO: err handling
				return;	
			}
			
			item.renamedDir = destinationDir;
			item.state = ItemStates.renamed;
			item.save(function(err) {}); //TODO: err handling
		});
	});
}

function rename(item) {
	console.log("Renaming " + item.name);
	
	var destinationDir = path.join(config[item.type + 'TargetDir'], item.name);
	
	if (item.type === ItemTypes.show)
		destinationDir = path.join(destinationDir, 'Season ' + item.no);

	doRename(item, destinationDir);			
}

module.exports.rename = rename;
