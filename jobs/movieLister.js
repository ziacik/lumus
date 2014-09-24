var Searcher = require('./searcher').Searcher;
var MovieSearcher = require('./movieSearcher').MovieSearcher;

var MovieLister = function(item, resultsCallback) {
	this.resultsCallback = resultsCallback;
	this.items = [];
	MovieSearcher.call(this, item);
};

MovieLister.prototype = Object.create(MovieSearcher.prototype);

MovieLister.prototype.setFail = function() {
	this.resultsCallback(this.items);
};

MovieLister.prototype.addTorrent = function() {
	this.items.push({ info : '', torrentInfo : this.torrentInfo });
	this.nextResult();
}

MovieLister.prototype.skipTorrent = function(reason) {
	this.items.push({ info : reason, torrentInfo : this.torrentInfo });
	this.nextResult();
} 

function searchFor(item, resultsCallback) {
	var searcher = new MovieLister(item, resultsCallback);	
	searcher.search();
	return searcher;
}

module.exports.searchFor = searchFor;
