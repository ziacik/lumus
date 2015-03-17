var Q = require('q');
var config = require('../config');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

var getFilterFunction = function(item) {
	if (item.type === ItemTypes.movie) {
		return movieFilter;
	} else if (item.type === ItemTypes.show) {
		return showFilter;
	} else if (item.type === ItemTypes.music) {
		return musicFilter;
	}
};

module.exports.first = function(item, results) {
	if (results.length === 0) {
		return undefined;
	}

	var filterFunction = getFilterFunction(item);

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

module.exports.all = function(item, results) {
	var filterFunction = getFilterFunction(item);
	var promises = results.map(function(result) {
		return Q.fcall(filterFunction, item, result);
	});
	return Q.all(promises).then(function(dummy) {
		return Q(results);
	});
};

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
	if (isUsedAlready(item, result.magnetLink)) {
		result.info = 'Already used.';
		return false;
	}
	
	if (result.size > config.get().movieSettings.maxSize) {
		result.info = 'Size exceeded the limit.';
		return false;
	}
	
	var digitalSoundRequirement = config.get().movieSettings.requireDigitalSound;
	
	if (digitalSoundRequirement !== config.Requirement.required) {
		return true;
	}
	
	return digitalAudioFilter(result);
};

var digitalAudioFilter = function(result) {
	return Q.when(result.getDescription()).then(function(description) {
		var digitalAudioKeywords = ['DTS', 'AC3', 'AC-3'];
		for (var i = 0; i < digitalAudioKeywords.length; i++) {
			isGoodKeywords = description.indexOf(digitalAudioKeywords[i]) >= 0;
			if (isGoodKeywords)
				break;
		}
		
		if (!isGoodKeywords) {
			result.info = 'Missing required keywords in description.';
		}
		
		return isGoodKeywords;
	});
};

var showFilter = function(item, result) {
	var correctSeasonRegex = /season\W*0*2(?![0-9])/i;
	var isCorrectSeason = correctSeasonRegex.test(result.title);
	
	if (!isCorrectSeason) {
		result.info = 'Wrong season.';
		return false;
	}
	
	if (isUsedAlready(item, result.magnetLink)) {
		result.info = 'Already used.';
		return false;
	}
	
	if (result.size > config.get().showSettings.maxSize) {
		result.info = 'Size exceeded the limit.';
		return false;
	}
	
	var digitalSoundRequirement = config.get().showSettings.requireDigitalSound;
	
	if (digitalSoundRequirement !== config.Requirement.required) {
		return true;
	}
	
	return digitalAudioFilter(result);
};

var musicFilter = function(item, result) {
	if (isUsedAlready(item, result.magnetLink)) {
		result.info = 'Already used.';
		return false;
	}
	
	if (result.size > config.get().musicSettings.maxSize) {
		result.info = 'Size exceeded the limit.';
		return false;
	}
	
	return true;
}; 