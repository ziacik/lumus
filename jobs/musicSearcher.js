var config = require('../config');
var Searcher = require('./searcher').Searcher;

var MusicSearcher = function(item) {
	Searcher.call(this, item);
};

MusicSearcher.prototype = Object.create(Searcher.prototype);

function searchFor(item) {
	var searcher = new MusicSearcher(item);
	searcher.search();
}

MusicSearcher.prototype.getSizeLimit = function() {
	return config.musicSizeLimit;
};

MusicSearcher.prototype.constructUrl = function(item) {
	var query = encodeURIComponent(item.name);
	var url = config.musicSearchUrl.replace('${query}', query);
	return url;
};

module.exports.searchFor = searchFor;
module.exports.MusicSearcher = MusicSearcher;