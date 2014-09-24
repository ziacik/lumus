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

MusicSearcher.prototype.getSearchTerm = function(item) {
	if (item.searchTerm)
		return item.searchTerm;
	
	return item.name;
};

MusicSearcher.prototype.getSizeLimit = function() {
	return config.musicSizeLimit;
};

MusicSearcher.prototype.constructUrl = function(item) {
	var query = encodeURIComponent(this.getSearchTerm(item));
	var url = config.musicSearchUrl.replace('${query}', query);
	return url;
};

module.exports.searchFor = searchFor;
module.exports.MusicSearcher = MusicSearcher;