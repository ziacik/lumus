var fs = require('fs');
var path = require('path');
var process = require('child_process');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

//TODO: moje lokalne transmission rpc vracia pri duplicate torrente aj ide, malina nie

function rename(item) {
	console.log("Renaming " + item.name);
	
	item.renamedDir = "/home/ziacik/Movies/" + item.name;
	
	try {
		fs.rename(item.downloadDir, item.renamedDir);
	} catch (e) {
		console.log(e);
	}
	
	item.state = ItemStates.renamed; /// Ignore failed renames.
	item.planNextCheck(1); //TODO hardcoded	
	item.save(function(err) {}); //TODO: err handling	
}

module.exports.rename = rename;
