var fs = require('fs');
var path = require('path');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

function rename(item, file) {
	console.log("Renaming " + file);
	var fileName = path.basename(file);

	fs.mkdirSync("/media/Pyre/Movies/" + item.name); //TODO hardcoded
	fs.rename(file, "/media/Pyre/Movies/" + item.name + "/" + fileName);

	item.state = ItemStates.renamed;
	item.planNextCheck(10); //TODO hardcoded	
	item.save();	
}

module.exports.rename = rename;
