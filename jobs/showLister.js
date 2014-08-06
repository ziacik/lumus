var Searcher = require('./searcher').Searcher;
var ShowSearcher = require('./showSearcher').ShowSearcher;

var ShowLister = function(item, resultsCallback) {
	this.resultsCallback = resultsCallback;
	this.items = [];
	ShowSearcher.call(this, item);
};

ShowLister.prototype = Object.create(ShowSearcher.prototype);

ShowLister.prototype.setFail = function() {
	this.resultsCallback(this.items);
};

ShowLister.prototype.addTorrent = function() {
	this.items.push({ info : '', torrentInfo : this.torrentInfo });
	this.nextResult();
}

ShowLister.prototype.skipTorrent = function(reason) {
	this.items.push({ info : reason, torrentInfo : this.torrentInfo });
	this.nextResult();
} 

function searchFor(item, resultsCallback) {
	var searcher = new ShowLister(item, resultsCallback);	
	searcher.search();
}

module.exports.searchFor = searchFor;
