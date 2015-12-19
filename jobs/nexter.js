var Q = require('q');
var config = require('../config');
var searcher = require('./searcher');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

module.exports.checkNext = function(item) {
	if (item.next) {
		return Q();
	}
	
	if (item.type === ItemTypes.show) {
		return checkNextShow(item);
	} else if (item.type === ItemTypes.music) {
		return checkNextMusic(item);
	}
	
	return Q();
};

var checkNextShow = function(item) {
	var itemNext = new Item();
	itemNext.name = item.name;
	itemNext.type = item.type;
	itemNext.externalId = item.externalId;
	itemNext.no = +item.no + 1; //FIXME why original no is a string
	
	return searcher.findIfExists(itemNext).then(function(result) {
		if (result) {
			item.next = itemNext.no;
			return item.save();
		};
	});
};

var checkNextMusic = function(item) {
	return Q();
};