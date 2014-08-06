var Searcher = require('./searcher').Searcher;
var MusicSearcher = require('./musicSearcher').MusicSearcher;

var MusicLister = function(item, resultsCallback) {
	this.resultsCallback = resultsCallback;
	this.items = [];
	MusicSearcher.call(this, item);
};

MusicLister.prototype = Object.create(MusicSearcher.prototype);

MusicLister.prototype.setFail = function() {
	this.resultsCallback(this.items);
};

MusicLister.prototype.addTorrent = function() {
	this.items.push({ info : '', torrentInfo : this.torrentInfo });
	this.nextResult();
}

MusicLister.prototype.skipTorrent = function(reason) {
	this.items.push({ info : reason, torrentInfo : this.torrentInfo });
	this.nextResult();
} 

function searchFor(item, resultsCallback) {
	var searcher = new MusicLister(item, resultsCallback);	
	searcher.search();
}

module.exports.searchFor = searchFor;
