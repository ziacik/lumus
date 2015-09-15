var Q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var config = require('../config');
var labels = require('../labels');

var tpb = require('thepiratebay');
var ItemTypes = require('../models/item').ItemTypes;

module.exports.name = 'The Pirate Bay';

config.add('tpbSearcher', { 
	type : 'literal', 
	store : {
		'searcher:tpbSearcher:use' : true,
		'searcher:tpbSearcher:url' : 'https://thepiratebay.la'
	}
});

labels.add({ 
	tpbSearcher : module.exports.name,
	'searcher:tpbSearcher:url' : 'Base URL'
});

module.exports.searchFor = function(item) {
	var searchTerm = getSearchTerm(item);
	
	tpb.setUrl(config.get().searcher.tpbSearcher.url);
	
	return tpb.search(searchTerm, {
		category : getCategory(item),
		orderBy : '7'
	}).then(function(searchResults) {
		return searchResults.map(convertDataItemToResult);	
	});
};

var getSearchTerm = function(item) {
	item.ensureSearchTerm();
	return item.searchTerm.replace(/-/g, '"-"');
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
	result.releaseName = guessReleaseName(dataItem);
	result.getDescription = function() {
		return getDescription(dataItem.link);
	};
	return result;
};

var guessReleaseName = function(dataItem) {
	return dataItem.name.replace(/\s*[.]?\[[a-zA-Z]+\]\s*$/, '');
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
		if (config.get().movieSettings.hdVideoPreference === config.Preference.required) {
			return "207";
		} else {
			return "200";
		}
	} else if (item.type === ItemTypes.show) {
		if (config.get().showSettings.hdVideoPreference === config.Preference.required) {
			return "208";
		} else if (config.get().showSettings.hdVideoPreference === config.Preference.unwanted) {
			return "205";
		} else {
			return "200";
		}
	} else if (item.type === ItemTypes.music) {
		if (config.get().musicSettings.losslessFormatPreference === config.Preference.required) {
			return "104";
		} else {
			return "100";
		}
	}
};