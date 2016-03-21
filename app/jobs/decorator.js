var Promise = require('bluebird');
var config = require('../config');
var subtitler = require('./subtitler');

var getDecoratorFunction = function(item) {
	if (item.type === 'Movie') {
		return movieDecorator;
	} else if (item.type === 'Season') {
		return showDecorator;
	} else if (item.type === 'Album') {
		return musicDecorator;
	}
};

module.exports.all = function(item, results) {
	if (item.type === 'Album') {
		return doDecoration(item, results);
	} else {
		return subtitler.listSubtitles(item).then(function(subtitles) {
			return doDecoration(item, results, subtitles);
		});
	}
};

var doDecoration = function(item, results, subtitles) {
	var decoratorFunction = getDecoratorFunction(item);

	var promises = results.map(function(result) {
		return decoratorFunction(item, result, subtitles);
	});

	return Promise.all(promises).then(function(dummy) {
		return Promise.resolve(results);
	});
}

var descriptionChecker = function(result) {
	return Promise.resolve(result.getDescription());
};

var hasDigitalAudio = function(description) {
	var digitalAudioKeywords = ['DTS', 'AC3', 'AC-3'];
	for (var i = 0; i < digitalAudioKeywords.length; i++) {
		isGoodKeywords = description.indexOf(digitalAudioKeywords[i]) >= 0;
		if (isGoodKeywords)
			break;
	}

	return isGoodKeywords;
};

var isHD = function(result, description) {
	var isFake720 = /(720\s*[x*]\s*[1-6][0-9][0-9])|(width[^\w]*720)/i.test(description)

	if (isFake720) {
		return false;
	}

	if (/(720)|(1080)/.test(result.title)) {
		return true;
	}

	if (/(720)|(1080)/.test(description)) {
		return true;
	}

	return false;
};

var getScore = function(result, setting, points) {
	var preference = config.get()[result.type.toLowerCase() + 'Settings'][setting + 'Preference'];

	if (preference === config.Preference.optional) {
		return 0;
	}

	var capitalizedSetting = setting.charAt(0).toUpperCase() + setting.substring(1);

	var shouldHaveIt = preference === config.Preference.required || preference === config.Preference.preferred;
	var haveIt = result['has' + capitalizedSetting] || result['is' + capitalizedSetting] || false;

	return (haveIt === shouldHaveIt) ? points : 0;
};

var releaseNameMatcher = function(releaseName) {
	return function(subtitleRecord) {
		if (!releaseName || !subtitleRecord.MovieReleaseName) {
			return false;
		}

		var lowerCaseReleaseName = releaseName.toLowerCase();
		var subtitleReleaseName = subtitleRecord.MovieReleaseName.toLowerCase();

		if (subtitleReleaseName === lowerCaseReleaseName) {
			return true;
		}

		if (stripSceneTags(subtitleReleaseName) === stripSceneTags(lowerCaseReleaseName)) {
			return true;
		}

		return false;
	};
};

var stripSceneTags = function(releaseName) {
	return releaseName.replace(/[.](limited|proper|internal|festival)([^a-zA-Z]|$)/, '\$2');
};

var movieDecorator = showDecorator = function(item, result, subtitles) {
	result.hasSubtitles = subtitles.some(releaseNameMatcher(result.releaseName));

	return descriptionChecker(result).then(function(description)  {
		result.type = item.type;
		result.hasDigitalAudio = hasDigitalAudio(description);
		result.hasHdVideo = isHD(result, description);
		result.score = result.hasSubtitles ? 1 : 0;
		result.score += result.verified ? 1 : 0;
		result.score += getScore(result, 'digitalAudio', 3);
		result.score += getScore(result, 'hdVideo', 3);
	});
};

var musicDecorator = function(item, result) {
	result.type = item.type;
	result.isLosslessFormat = (/FLAC/i).test(result.title);
	result.score = getScore(result, 'losslessFormat', 1);
	return result;
};
