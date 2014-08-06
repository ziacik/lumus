var movieLister = require('./movieLister');
var showLister = require('./showLister');
var musicLister = require('./musicLister');

var ItemTypes = require('../models/item').ItemTypes;

function searchFor(item, resultsCallback) {
	if (item.type === ItemTypes.movie)
		movieLister.searchFor(item, resultsCallback);
	else if (item.type === ItemTypes.music)
		musicLister.searchFor(item, resultsCallback);
	else if (item.type === ItemTypes.show)
		showLister.searchFor(item, resultsCallback);
}

module.exports.searchFor = searchFor;