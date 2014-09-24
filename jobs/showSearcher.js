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

ShowSearcher.prototype.getSearchTerm = function(item) {
	if (item.searchTerm)
		return item.searchTerm;
	
	return item.name + " season -seasons -episode -episodes";
};

ShowSearcher.prototype.getSizeLimit = function() {
	return config.showSizeLimit;
};

ShowSearcher.prototype.constructUrl = function(item) {
	var query = encodeURIComponent(this.getSearchTerm(item));
	var url = config.showSearchUrl.replace('${query}', query);
	return url;
};

ShowSearcher.prototype.finalize = function() {
	var itemTitle = this.$resultElement.children('.detLink').attr('title');
	
	if (itemTitle.indexOf('Season ' + this.item.no) < 0)
		this.skipTorrent('not the season looking for');		
	else
		Searcher.prototype.finalize.call(this);
};

module.exports.searchFor = searchFor;
module.exports.ShowSearcher = ShowSearcher;