var Q = require('q');
var config = require('../config');
var searcher = require('./searcher');

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
		} else {
			item.rescheduleNextDay();
		}
	});
};

var checkNextMusic = function(item) {
	item.rescheduleNextDay();
	return Q();
};