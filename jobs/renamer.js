var config = require('../config');
var fs = require('fs');
var path = require('path');
var process = require('child_process');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

//TODO: moje lokalne transmission rpc vracia pri duplicate torrente aj id, malina nie

function rename(item) {
	console.log("Renaming " + item.name);
	
	try {
		var destinationDir = path.join(config[item.type + 'TargetDir'], item.name);	
		fs.renameSync(item.downloadDir, destinationDir);
		item.renamedDir = destinationDir;
		item.state = ItemStates.renamed;
		item.planNextCheck(1); //TODO hardcoded	
	} catch (e) {
		item.state = ItemStates.renameFailed;
		console.log(e);
	}
	
	item.save(function(err) {}); //TODO: err handling	
}

module.exports.rename = rename;
