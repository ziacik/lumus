var config = require('../config');

var Kickass = require('node-kickass');
var ItemTypes = require('../models/item').ItemTypes;

var searchFor = function(item, callback) {
	console.log('Searching for ' + item.name + ' with kickass');

	var k = new Kickass().setQuery(getSearchTerm(item) + ' category:' + getCategory(item)).setSort({
		field : "seeders",
		sorder : "desc"
	}).run(function(errors, data) {
		console.log('Done searching for ' + item.name + ' with kickass');

		if (errors.length <= 0) {
			var results = [];
			var filterFunction = getFilterFunction(item);
			
			for (var i = 0; i < data.length; i++) {
				var dataItem = data[i];
				if (filterFunction(dataItem)) {
					var result = convertDataItemToResult(dataItem);
					results.push(result);
					break;
				}
			}
			
			callback(results);
		} else {
			console.log(errors, "errors");
			callback(undefined, errors);
		}
	})
};

var getSearchTerm = function(item) {
	if (item.searchTerm)
		return item.searchTerm;
	
	if (item.year)
		return item.name + " " + item.year;
	else
		return item.name;
};

var convertDataItemToResult = function(dataItem) {
	var result = {};
	result.magnetLink = dataItem['torrent:magneturi']['#'];
	result.torrentInfoUrl = dataItem['link'];
	return result;
};

var getCategory = function(item) {
	if (item.type === ItemTypes.movie) {
		return "highres-movies";
	} else if (item.type === ItemTypes.show) {
		return "tv";
	} else if (item.type === ItemTypes.music) {
		return "music";
	}
};

var getFilterFunction = function(item) {
	if (item.type === ItemTypes.movie) {
		return movieFilter;
	} else if (item.type === ItemTypes.show) {
		return showFilter;
	} else if (item.type === ItemTypes.music) {
		return musicFilter;
	}
};

var movieFilter = function(dataItem) {
	console.log('Filtering ' + dataItem.title);

	if (!dataItem.categories.some(function(category) { return category.indexOf('High') >= 0; })) {
		console.log('Not in high res category.');
		return false;
	}
	
	var size = parseInt(dataItem['torrent:contentlength']['#']) / 1048576;
	
	if (size > config.movieSizeLimit) {
		console.log('Size too big: ' + size + '.');
		return false;
	}
	
	console.log(dataItem);
	
	return true;
};

var showFilter = function(dataItem) {
	return true;
};

var musicFilter = function(dataItem) {
	return true;
};

module.exports.searchFor = searchFor;