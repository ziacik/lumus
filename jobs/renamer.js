var config = require('../config');
var fs = require('fs');
var path = require('path');
var process = require('child_process');
var rmdir = require('rimraf');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

//TODO: moje lokalne transmission rpc vracia pri duplicate torrente aj id, malina nie

function doRename(item, destinationDir) {
	fs.rename(item.downloadDir, destinationDir, function(error) {
		if (error) {
			console.log(error);
			item.state = ItemStates.renameFailed;
			item.save(function(err) {}); //TODO: err handling
			return;	
		}
		
		item.renamedDir = destinationDir;
		item.state = ItemStates.renamed;
		item.planNextCheck(1); //TODO hardcoded			
		item.save(function(err) {}); //TODO: err handling
	});
}

function rename(item) {
	console.log("Renaming " + item.name);
	
	var destinationDir = path.join(config[item.type + 'TargetDir'], item.name);
	
	fs.exists(destinationDir, function(exists) {
		if (exists && item.type != 'music') { //TODO hardcoded
			rmdir(destinationDir, function(error) {
				if (error) {
					console.log(error);
					item.state = ItemStates.renameFailed;
					item.save(function(err) {}); //TODO: err handling
					return;	
				}
				
				doRename(item, destinationDir);			
			});			
		} else {
			doRename(item, destinationDir);
		}
	});
}

module.exports.rename = rename;
