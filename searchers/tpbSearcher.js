var Q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var config = require('../config');
var labels = require('../labels');

var tpb = require('thepiratebay');
var ItemTypes = require('../models/item').ItemTypes;

module.exports.name = 'The Pirate Bay';

config.add('tpbSearcher', { type : 'literal', store : {'searcher:tpbSearcher:use' : true }});
//TODO url
labels.add({ tpbSearcher : module.exports.name });

module.exports.searchFor = function(item) {
	var searchTerm = getSearchTerm(item);
	
	return tpb.search(searchTerm, {
		category : getCategory(item),
		orderBy : '7'
	}).then(function(searchResults) {
		return searchResults.map(convertDataItemToResult);	
	});
};

var getSearchTerm = function(item) {
	var term;

	if (item.searchTerm) {
		term = item.searchTerm;
	} else  if (item.type === ItemTypes.show) {
		term = item.name + '"season ' + item.no + '" complete';
	} else if (item.year) {
		term = item.name + " " + item.year;
	} else {
		term = item.name;
	}
	
	return term.replace(/-/g, '"-"');
};

var convertSize = function(sizeStr) {
	var sizeMatches = sizeStr.match(/([0-9]+[.]?[0-9]*)[^0-9]+(KiB|MiB|GiB)/); // todo rewise
	
	if (sizeMatches == null || sizeMatches.length < 3) {		
	 	throw 'Unable to determine size from "' + sizeStr + '".';
	}		 		
	
	var size = parseFloat(sizeMatches[1]);
	
	if (sizeMatches[2] === 'GiB')
		size = size * 1000;
	else if (sizeMatches[2] === 'KiB')
		size = size / 1000;	
		
	return size;
};

var convertDataItemToResult = function(dataItem) {
	var result = {};	
	result.title = dataItem.name;
	result.magnetLink = dataItem.magnetLink;
	result.torrentInfoUrl = dataItem.link;
	result.size = convertSize(dataItem.size);
	result.seeds = dataItem.seeders;
	result.leechs = dataItem.leechers;
	result.releaseName = dataItem.name; //TODO not right, but how do i get it?
	result.getDescription = function() {
		return getDescription(dataItem.link);
	};
	return result;
};

var getDescription = function(link) {
	var deferred = Q.defer();
	
	request({
		method: 'GET',
    	uri: link,
    	gzip: true
    }, function(error, response, body) {
		if (error) {
			return deferred.reject(error);
		}

		$ = cheerio.load(body);
		var description = $('.nfo').text();
		deferred.resolve(description);
	});
	
	return deferred.promise;
}

var getCategory = function(item) {
	if (item.type === ItemTypes.movie) {
		return "207";
	} else if (item.type === ItemTypes.show) {
		return "205";
	} else if (item.type === ItemTypes.music) {
		return "100";
	}
};