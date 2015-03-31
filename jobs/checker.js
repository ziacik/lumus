var Q = require('q');
var config = require('../config');
var torrenter = require('./torrenter');
var searcher = require('./searcher');
var renamer = require('./renamer');
var subtitler = require('./subtitler');
var notifier = require('./notifier');
var kodi = require('../notifiers/kodi');
var opensubtitler = require('../subtitlers/opensubtitler');
var tpbSearcher = require('../searchers/tpbSearcher');
var kickassSearcher = require('../searchers/kickassSearcher');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

var configuration = config.get();

if (configuration.notifier.kodi.use) {
	notifier.use(kodi);
}

if (configuration.subtitler.opensubtitler.use) {
	subtitler.use(opensubtitler);
}

if (configuration.searcher.tpbSearcher.use) {
	searcher.use(tpbSearcher);
}

if (configuration.searcher.kickassSearcher.use) {
	searcher.use(kickassSearcher);
}

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
	return item.save();
}

function isAfterSubtitlerRetryLimit(item) {
	return false; //TODO Or?
}

function check() {
	checkActive();
	checkFinished();
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
		if (isMusic(item))
			return finish(item);
		else
			return subtitler.findSubtitles(item);
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
	Item.find({state : {$nin : [ItemStates.finished, ItemStates.renameFailed]}, $not: {nextCheck : {$gt : new Date().toJSON()}}}).then(function(items) {
		var itemCheckers = items.map(function(item) {
			return Q.fcall(checkOne, item);
		});
		
		return Q.allSettled(itemCheckers); /// Or should I run it sequentially? Probably yes.
	}).then(function() {	
		setTimeout(check, config.get().checkInterval * 1000);
	}).catch(function(error) {
		require('util').error(error);
		setTimeout(check, config.get().checkInterval * 1000);
	});
}

function checkFinished() {
	if (!config.get().removeFinishedDays) {
		return;
	}
		
	var now = new Date();
	var deleteDate = new Date(now);
    deleteDate.setDate(now.getDate() - config.get().removeFinishedDays);

	Item.find({state : ItemStates.finished, createdAt : {$lt : deleteDate.toJSON()}})
	.then(function(items) {
		for (var index in items) {
			var item = items[index];
			
			console.log('Removing finished ' + item.name);
			
			item.remove(function(err) {
				if (err)
					console.log(err);
			});
		}
	}).catch(function(error) {
		util.error(error.stack || error);
	});
}

module.exports = check;