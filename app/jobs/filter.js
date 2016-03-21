var Promise = require('bluebird');
var config = require('../config');

var getFilterFunction = function(item) {
	if (item.type === 'Movie') {
		return movieFilter;
	} else if (item.type === 'Show') {
		return showFilter;
	} else if (item.type === 'Music') {
		return musicFilter;
	}
};

module.exports.first = function(item, results) {
	if (results.length === 0) {
		return undefined;
	}

	var filterFunction = getFilterFunction(item);

	var resultIndex = 0;

	function loop() {
		var result = results[resultIndex];
		resultIndex++;

		return Promise.resolve(filterFunction(item, result)).then(function(isSuccess) {
			if (isSuccess) {
				return result;
			} else if (resultIndex >= results.length) {
				return;
			} else {
				return loop();
			}
		});
	}

	return loop();
};

module.exports.all = function(item, results) {
	var filterFunction = getFilterFunction(item);
	var promises = results.map(function(result) {
		return filterFunction(item, result);
	});
	return Promise.all(promises).then(function(dummy) {
		return results;
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

var genericFilter = function(item, result) {
	if (isUsedAlready(item, result.magnetLink)) {
		result.info = 'Already used.';
		return false;
	}

	if (result.seeds == 0) {
		result.info = 'No seeders.';
		return false;
	}

	if (!yearFilter(item, result)) {
		result.info = 'Wrong year.';
		return false;
	}

	return true;
}

var digitalAudioFilter = function(result) {
	if (!result.hasDigitalAudio && config.get()[result.type.toLowerCase() + 'Settings'].digitalAudioPreference === config.Preference.required) {
		result.info = 'Doesn\'t have digital audio.';
		return false;
	}

	if (result.hasDigitalAudio && config.get()[result.type.toLowerCase() + 'Settings'].digitalAudioPreference === config.Preference.unwanted) {
		result.info = 'Has digital audio.';
		return false;
	}

	return true;
};

var hdVideoFilter = function(result) {
	if (!result.hasHdVideo && config.get()[result.type.toLowerCase() + 'Settings'].hdVideoPreference === config.Preference.required) {
		result.info = 'Is not HD.';
		return false;
	}

	if (result.hasHdVideo && config.get()[result.type.toLowerCase() + 'Settings'].hdVideoPreference === config.Preference.unwanted) {
		result.info = 'Is HD.';
		return false;
	}

	return true;
};

var losslessFilter = function(result) {
	if (!result.isLosslessFormat && config.get().musicSettings.losslessFormatPreference === config.Preference.required) {
		result.info = 'Is not lossless.';
		return false;
	}

	if (result.isLosslessFormat && config.get().musicSettings.losslessFormatPreference === config.Preference.unwanted) {
		result.info = 'Is lossless.';
		return false;
	}

	return true;
};


var yearFilter = function(item, result) {
	if (!item.year) {
		return true;
	}

	var yearMatch = result.title.match(/[^0-9](((19)|(20))[0-9][0-9])[^0-9]/);

	if (yearMatch && yearMatch[1] != item.year) {
		return false;
	}

	return true;
};

var movieFilter = function(item, result) {
	if (!genericFilter(item, result)) {
		return false;
	}

	if (result.size > config.get().movieSettings.maxSize) {
		result.info = 'Size exceeded the limit.';
		return false;
	}

	if (!digitalAudioFilter(result)) {
		return false;
	}

	if (!hdVideoFilter(result)) {
		return false;
	}

	return true;
};

var showFilter = function(item, result) {
	if (!genericFilter(item, result)) {
		return false;
	}

	var correctSeasonRegex = new RegExp('season\\W*0*' + item.no + '(?![0-9])', 'i');
	var isCorrectSeason = correctSeasonRegex.test(result.title);

	if (!isCorrectSeason) {
		result.info = 'Wrong season.';
		return false;
	}

	if (result.size > config.get().showSettings.maxSize) {
		result.info = 'Size exceeded the limit.';
		return false;
	}

	if (!digitalAudioFilter(result)) {
		return false;
	}

	if (!hdVideoFilter(result)) {
		return false;
	}

	return true;
};

var musicFilter = function(item, result) {
	if (!genericFilter(item, result)) {
		return false;
	}

	if (result.size > config.get().musicSettings.maxSize) {
		result.info = 'Size exceeded the limit.';
		return false;
	}


	if (!losslessFilter(result)) {
		return false;
	}

	return true;
};
