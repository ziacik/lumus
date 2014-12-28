//var movieLister = require('./movieLister');
//var showLister = require('./showLister');
//var musicLister = require('./musicLister');

var ItemTypes = require('../models/item').ItemTypes;

function searchFor(item, resultsCallback) {
	/*if (item.type === ItemTypes.movie)
		return movieLister.searchFor(item, resultsCallback);
	else if (item.type === ItemTypes.music)
		return musicLister.searchFor(item, resultsCallback);
	else if (item.type === ItemTypes.show)
		return showLister.searchFor(item, resultsCallback);*/ //TODO
}

module.exports.searchFor = searchFor;