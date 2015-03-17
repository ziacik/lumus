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

var movieDecorator = showDecorator = function(item, result) {
	return subtitler.hasSubtitlesForName(result.releaseName).then(function(hasSubtitles) {
		result.hasSubtitles = hasSubtitles;
	});
};

var musicDecorator = function(item, result) {
	return result;
}; 