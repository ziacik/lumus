var config = require('../config');
var Searcher = require('./searcher').Searcher;

var ShowSearcher = function(item) {
	Searcher.call(this, item);
};

ShowSearcher.prototype = Object.create(Searcher.prototype);

function searchFor(item) {
	var searcher = new ShowSearcher(item);
	searcher.search();
}

ShowSearcher.prototype.getSizeLimit = function() {
	return config.showSizeLimit;
};

ShowSearcher.prototype.constructUrl = function(item) {
	var query = encodeURIComponent(item.name + " season -seasons -episode -episodes");
	var url = config.showSearchUrl.replace('${query}', query);
	return url;
};

ShowSearcher.prototype.finalize = function() {
	var itemTitle = this.$resultElement.children('.detLink').attr('title');
	
	if (itemTitle.indexOf('Season ' + this.item.no) < 0)
		this.skipTorrent('not the season looking for');		
	else
		this.addTorrent();
};

module.exports.searchFor = searchFor;
module.exports.ShowSearcher = ShowSearcher;