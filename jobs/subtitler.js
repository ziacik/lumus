var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

var services = [];

function use(service) {
	services.push(service);
}

function setSubtitlerFail(item) {
	item.state = ItemStates.subtitlerFailed;
	item.planNextCheck(3600*24); //TODO hardcoded
	item.save(function(err) {}); //TODO
}

function setSubtitlerSuccess(item) {
	item.state = ItemStates.subtitled;
	//TODO should trigger next step immediately
	item.save(function(err) {}); //TODO
}

function findSubtitles(item) {
	findSubtitlesWithService(item, 0);
}

function findSubtitlesWithService(item, serviceIndex, err) {
	if (serviceIndex >= services.length) {
		if (err)
			setSubtitlerFail(item);
		else
			setSubtitlerSuccess(item);

		console.log("Done looking for subtitles for item " + item.name + " (err: " + err + ")");

		return; 
	}
	
	console.log("Looking for subtitles for item " + item.name + " with service " + serviceIndex);	
	
	services[serviceIndex].findSubtitles(item, function(err) {
		if (err) {
			findSubtitlesWithService(item, serviceIndex + 1, err);
			return;
		}
		
		setSubtitlerSuccess(item);		
	});
}

module.exports.use = use;
module.exports.findSubtitles = findSubtitles;