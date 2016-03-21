var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var config = require('../config');
var labels = require('../labels');

var tpb = require('thepiratebay');

module.exports.name = 'The Pirate Bay';

config.add('tpbSearcher', {
	type: 'literal',
	store: {
		'searcher:tpbSearcher:use': true,
		'searcher:tpbSearcher:url': 'https://thepiratebay.se'
	}
});

labels.add({
	tpbSearcher: module.exports.name,
	'searcher:tpbSearcher:url': 'Base URL'
});

module.exports.searchFor = function(item) {
	var searchTerm = getSearchTerm(item);

	tpb.setUrl(config.get().searcher.tpbSearcher.url);

	return tpb.search(searchTerm, {
		category: getCategory(item),
		orderBy: '7'
	}).then(function(searchResults) {
		return searchResults.map(convertDataItemToResult);
	});
};

var getSearchTerm = function(item) {
	//TODO item.ensureSearchTerm();
	item.searchTerm = item.name;
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
	return request({
		method: 'GET',
		uri: link,
		gzip: true,
		transform: function(body) {
			return cheerio.load(body);
		}
	}).then(function($) {
		return $('.nfo').text();
	});
}

var getCategory = function(item) {
	if (item.type === 'Movie') {
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
