var Q = require('q');
var config = require('../config');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

module.exports.first = function(item, results) {
	var filterFunction;
	
	if (item.type === ItemTypes.movie) {
		filterFunction = movieFilter;
	} else if (item.type === ItemTypes.show) {
		filterFunction = showFilter;
	} else if (item.type === ItemTypes.music) {
		filterFunction = musicFilter;
	}	

	var deferred = Q.defer();	
	var resultIndex = 0;
	
	function loop() {
		var result = results[resultIndex];
		resultIndex++;
	
		Q.when(filterFunction(item, result), function(isSuccess) {
			if (isSuccess) {
				deferred.resolve(result);
			} else if (resultIndex >= results.length) {
				deferred.resolve(undefined);
			} else {
				loop();
			}
		}, function(error) {
			deferred.reject(error);
		});
	}
	
	Q.nextTick(loop);
	
	return deferred.promise;
}

var isUsedAlready = function(item, magnetLink) {
	if (!item.torrentLinks) {
		return false;
	}
	
	for (i = 0; i < item.torrentLinks.length; i++) {
		if (item.torrentLinks[i] === magnetLink) {
			return true;
		}
	}
	
	return false;
};

var movieFilter = function(item, result) {
	console.log('Filtering ' + result.title);
	
	if (isUsedAlready(item, result.magnetLink)) {
		console.log('Already used.');
		return false;
	}
	
	if (result.size > config.movieSizeLimit) {
		console.log('Size exceeded.');
		return false;
	}
	
	return Q.when(result.getDescription()).then(function(description) {
		var isGoodKeywords = true;
		for (var i = 0; i < config.movieRequiredKeywords.length; i++) {
			isGoodKeywords = description.indexOf(config.movieRequiredKeywords[i]) >= 0;
			if (isGoodKeywords)
				break;
		}
		
		console.log('Has good keywords: ' + isGoodKeywords);
		return isGoodKeywords;
	});
};

var showFilter = function(item, result) {
	console.log('Filtering ' + result.title);
	
	if (isUsedAlready(item, result.magnetLink)) {
		console.log('Already used.');
		return false;
	}
	
	if (result.size > config.showSizeLimit) {
		console.log('Size exceeded.');
		return false;
	}
	
	return true;
};

var musicFilter = function(item, result) {
	console.log('Filtering ' + result.title);
	
	if (isUsedAlready(item, result.magnetLink)) {
		console.log('Already used.');
		return false;
	}
	
	if (result.size > config.musicSizeLimit) {
		console.log('Size exceeded.');
		return false;
	}
	
	return true;
}; 