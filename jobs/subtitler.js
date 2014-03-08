var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

function findSubtitles(item) {
	console.log("Searching for subtitles for " + item.name);
	//TODO Stub.
	
	item.state = ItemStates.subtitled;
	item.planNextCheck(1); /// So that renames goes on right away.
	item.save(function(err){});//TODO
}

module.exports.findSubtitles = findSubtitles;