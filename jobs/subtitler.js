var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

function findSubtitles(item) {
	console.log("Searching for subtitles for " + item.name);
	//TODO Stub.
	
	item.state = ItemStates.subtitlerFailed;
	item.planNextCheck(3600*24); /// Reschedule in 1 day.
	item.save(function(err){
		if (err)
			console.log(err);
	});
}

module.exports.findSubtitles = findSubtitles;