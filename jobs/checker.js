var Q = require('q');
var util = require('util');
var config = require('../config');
var torrenter = require('./torrenter');
var searcher = require('./searcher');
var renamer = require('./renamer');
var subtitler = require('./subtitler');
var notifier = require('./notifier');
var nexter = require('./nexter');
var kodi = require('../notifiers/kodi');
var opensubtitler = require('../subtitlers/opensubtitler');
var tpbSearcher = require('../searchers/tpbSearcher');
//var kickassSearcher = require('../searchers/kickassSearcher');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

var configure = function() {
	var configuration = config.get();
	
	if (configuration.notifier.kodi.use) {
		notifier.use(kodi);
	} else {
		notifier.unuse(kodi);
	}
	
	if (configuration.subtitler.opensubtitler.use) {
		subtitler.use(opensubtitler);
	} else {
		subtitler.unuse(opensubtitler);
	}
	
	if (configuration.searcher.tpbSearcher.use) {
		searcher.use(tpbSearcher);
	} else {
		searcher.unuse(tpbSearcher);
	}
	
//	if (configuration.searcher.kickassSearcher.use) {
//		searcher.use(kickassSearcher);
//	} else {
//		searcher.unuse(kickassSearcher);
//	}
};

function isMusic(item) {
	return item.type === ItemTypes.music;
}

function isMovie(item) {
	return item.type === ItemTypes.movie;
}

function isShow(item) {
	return item.type === ItemTypes.show;
}

var finish = function(item) {
	item.state = ItemStates.finished;
	delete item.searchResults;
	return item.save();
}

function isAfterSubtitlerRetryLimit(item) {
	return false; //TODO Or?
}

function check() {
	return checkActive().then(checkFinished).catch(function(err) {
		util.error(err.stack || err);
	});
}

function checkOne(item) {
	if (item.state === ItemStates.wanted) {
		return searcher.findAndAdd(item);
	} else if (item.state === ItemStates.snatched) {
		return torrenter.checkFinished(item);
	} else if (item.state === ItemStates.downloaded) {
		return renamer.rename(item);
	} else if (item.state === ItemStates.renamed) {
		return notifier.updateLibrary(item);
	} else if (item.state === ItemStates.libraryUpdated) {
		if (isMusic(item)) {
			return finish(item);
		} else {
			return subtitler.findSubtitles(item);
		}
	} else if (item.state === ItemStates.subtitlerFailed) {
		if (isAfterSubtitlerRetryLimit(item)) {
			return finish(item);
		} else {
			return subtitler.findSubtitles(item);
		}
	} else if (item.state === ItemStates.subtitled) {
		return finish(item);
	} else {
		throw new Error('Invalid state ' + item.state);
	}
};

function checkActive() {
	return Item.find({state : {$nin : [ItemStates.finished, ItemStates.renameFailed, ItemStates.libraryUpdateFailed]}, $not: {nextCheck : {$gt : new Date().toJSON()}}}).then(function(items) {
		var itemCheckers = items.map(function(item) {
			return Q.fcall(checkOne, item);
		});
		
		return Q.allSettled(itemCheckers); /// Or should I run it sequentially? Probably yes.
	}).then(function() {	
		setTimeout(check, config.get().checkInterval * 1000);
	}).catch(function(error) {
		util.error(error);
		setTimeout(check, config.get().checkInterval * 1000);
	});
}

function checkFinished() {
	return checkFinishedToRemove().then(checkFinishedToNext);
}

function checkFinishedToNext() {
	return Item.find({state : ItemStates.finished, type : {$in : [ItemTypes.show]}, next : {$exists : false}})
	.then(function(items) {
		return Q.allSettled(items.map(function(item) {
			return nexter.checkNext(item);
		}));
	}).catch(function(error) {
		util.error(error.stack || error);
	});
}

function checkFinishedToRemove() {
	if (!config.get().removeFinishedDays) {
		return Q();
	}
		
	var now = new Date();
	var deleteDate = new Date(now);
    deleteDate.setDate(now.getDate() - config.get().removeFinishedDays);

	return Item.find({state : ItemStates.finished, createdAt : {$lt : deleteDate.toJSON()}})
	.then(function(items) {
		return Q.allSettled(items.map(function(item) {
			return item.remove();
		}));
	}).catch(function(error) {
		util.error(error.stack || error);
	});
}

configure();

module.exports = check;
module.exports.configure = configure;