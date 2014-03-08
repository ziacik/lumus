var config = require('../config');
var fs = require('fs');
var path = require('path');
var process = require('child_process');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

//TODO: moje lokalne transmission rpc vracia pri duplicate torrente aj ide, malina nie

function rename(item) {
	console.log("Renaming " + item.name);
	
	console.log(config);
	console.log(item.type);
	console.log(config[item.type + 'TargetDir']);
		
	try {
		var destinationDir = path.join(config[item.type + 'TargetDir'], item.name);	
		fs.rename(item.downloadDir, destinationDir);
		item.renamedDir = destinationDir;
	} catch (e) {
		console.log(e);
	}
	
	item.state = ItemStates.renamed; /// Ignore failed renames.
	item.planNextCheck(1); //TODO hardcoded	
	item.save(function(err) {}); //TODO: err handling	
}

module.exports.rename = rename;
