var Q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var config = require('../config');
var labels = require('../labels');

var kat = require('kat-api');
var ItemTypes = require('../models/item').ItemTypes;

module.exports.name = 'Kickass Torrents';

config.add('kickassSearcher', { type : 'literal', store : {'searcher:kickassSearcher:use' : true }});
//TODO url
labels.add({ kickassSearcher : module.exports.name });


module.exports.searchFor = function(item) {
	return kat.search({
		query : getSearchTerm(item),
		category : getCategory(item),
		sort_by : 'seeders',
		order : 'desc'
	}).then(function(data) {
		return data.results.map(convertDataItemToResult);
	}).catch(function(err) {
		if (err.message === 'No results' || err.message === 'No data') {
			return [];
		} else {
			throw err;
		}
	});
};

var getSearchTerm = function(item) {
	item.ensureSearchTerm();
	return item.searchTerm.replace(/-/g, '"-"');
};

var convertDataItemToResult = function(dataItem) {
	var result = {};	
	result.title = dataItem.title;
	result.magnetLink = dataItem.magnet;
	result.torrentInfoUrl = dataItem.link;
	result.size = dataItem.size / 1048576 | 0;
	result.seeds = dataItem.seeds;
	result.leechs = dataItem.leechs;
	result.verified = 1 === dataItem.verified;
	result.releaseName = guessReleaseName(dataItem);
	result.getDescription = function() {
		return getDescription(dataItem.link);
	};
	return result;
};

var guessReleaseName = function(dataItem) {
	return dataItem.title.replace(/\s*[.]?\[[a-zA-Z]+\]\s*$/, '');
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
		var description = $('#desc').text();
		deferred.resolve(description);
	});
	
	return deferred.promise;
}

var getCategory = function(item) {
	if (item.type === ItemTypes.movie) {
		return "movies";
	} else if (item.type === ItemTypes.show) {
		return "tv";
	} else if (item.type === ItemTypes.music) {
		return "music";
	}
};