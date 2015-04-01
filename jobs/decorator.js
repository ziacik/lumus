var Q = require('q');
var config = require('../config');
var subtitler = require('./subtitler');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

var getDecoratorFunction = function(item) {
	if (item.type === ItemTypes.movie) {
		return movieDecorator;
	} else if (item.type === ItemTypes.show) {
		return showDecorator;
	} else if (item.type === ItemTypes.music) {
		return musicDecorator;
	}
};

module.exports.all = function(item, results) {
	var decoratorFunction = getDecoratorFunction(item);
	var promises = results.map(function(result) {
		return Q.fcall(decoratorFunction, item, result);
	});
	return Q.all(promises).then(function(dummy) {
		return Q(results);
	});
};

var descriptionChecker = function(result) {
	return Q.when(result.getDescription());
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
	var preference = config.get()[result.type + 'Settings'][setting + 'Preference'];
	
	if (preference === config.Preference.optional) {
		return 0;
	}
	
	var capitalizedSetting = setting.charAt(0).toUpperCase() + setting.substring(1);
	
	var shouldHaveIt = preference === config.Preference.required || preference === config.Preference.preferred;
	var haveIt = result['has' + capitalizedSetting] || result['is' + capitalizedSetting] || false;
	
	return (haveIt === shouldHaveIt) ? points : 0;
};

var movieDecorator = showDecorator = function(item, result) {
	return subtitler.hasSubtitlesForName(result.releaseName).then(function(hasSubtitles) {
		result.hasSubtitles = hasSubtitles;
		return descriptionChecker(result);
	}).then(function(description)  {
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