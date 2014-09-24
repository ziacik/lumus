var request = require('request');
var cheerio = require('cheerio');
var config = require('../config');
var Searcher = require('./searcher').Searcher;

var MovieSearcher = function(item) {
	Searcher.call(this, item);
};

MovieSearcher.prototype = Object.create(Searcher.prototype);

function searchFor(item) {
	var searcher = new MovieSearcher(item);
	searcher.search();
}

MovieSearcher.prototype.getSearchTerm = function(item) {
	if (item.searchTerm)
		return item.searchTerm;
	
	return item.name + " " + item.year;
};

MovieSearcher.prototype.getSizeLimit = function() {
	return config.movieSizeLimit;
};

MovieSearcher.prototype.constructUrl = function(item) {
	var query = encodeURIComponent(this.getSearchTerm(item));
	var url = config.movieSearchUrl.replace('${query}', query);
	return url;
};

MovieSearcher.prototype.finalize = function() {	
	request(this.torrentInfo.torrentPageUrl, function(error, response, body) {
		if (error) {
			console.log(error);
			return;
		}
		
		$ = cheerio.load(body);					
		var nfo = $('.nfo').text();
		var comments = $('#comments').text().toLowerCase();
		
		var isGoodKeywords = true;
		
		for (var i = 0; i < config.movieRequiredKeywords.length; i++) { 
			isGoodKeywords = nfo.indexOf(config.movieRequiredKeywords[i]) >= 0;
			if (isGoodKeywords)
				break;
		}
		
		var isNotShit = comments.indexOf('shit') < 0 && comments.indexOf('crap') < 0 && comments.indexOf('hardcoded') < 0  && comments.indexOf('hard coded') < 0; 				
				
		if (!isGoodKeywords) {	
			this.skipTorrent('required keywords not found');
		} else if (!isNotShit) {	
			this.skipTorrent('is commented as crap');
		} else {
			Searcher.prototype.finalize.call(this);
		}
		
	}.bind(this));
}

module.exports.searchFor = searchFor;
module.exports.MovieSearcher = MovieSearcher;