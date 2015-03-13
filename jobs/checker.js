var config = require('../config');
var torrenter = require('./torrenter');
var searcher = require('./searcher');
var renamer = require('./renamer');
var subtitler = require('./subtitler');
var notifier = require('./notifier');
var xbmc = require('../notifiers/xbmc');
var opensubtitler = require('../subtitlers/opensubtitler');
var tpbSearcher = require('../searchers/tpbSearcher');
var kickassSearcher = require('../searchers/kickassSearcher');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

var configuration = config.get();

if (configuration.notifier.kodi.use) {
	notifier.use(xbmc);
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

function search(item) {
	searcher.findAndAdd(item);
}

function finish(item) {	
	item.state = ItemStates.finished;
	item.save(function(err) {
		if (err) 
			console.log(err);
	});
}

function isAfterSubtitlerRetryLimit(item) {
	return false; //TODO Or?
}

function check() {
	checkActive();
	checkFinished();
}

function checkActive() {
	Item.find({state : {$nin : [ItemStates.finished, ItemStates.renameFailed]}, $not: {nextCheck : {$gt : new Date().toJSON()}}}, function(err, items) {
		if (err) {
			console.log(err);
		} else {		
			for (var index in items) {
				var item = items[index];
				
				console.log('Checking ' + item.name);
				
				if (item.state === ItemStates.wanted) {
					search(item);
				} else if (item.state === ItemStates.snatched) {
					torrenter.checkFinished(item);
				} else if (item.state === ItemStates.downloaded) {
					renamer.rename(item);
				} else if (item.state === ItemStates.renamed) {
					notifier.updateLibrary(item);
				} else if (item.state === ItemStates.libraryUpdated) {
					if (isMusic(item))
						finish(item);
					else
						subtitler.findSubtitles(item);
				} else if (item.state === ItemStates.subtitlerFailed) {
					if (isAfterSubtitlerRetryLimit(item)) {
						finish(item);
					} else {
						subtitler.findSubtitles(item);
					}
				} else if (item.state === ItemStates.subtitled) {
					finish(item);
				} else {
					console.log('Invalid state ' + item.state);
				}
			}
		}
		
		setTimeout(check, config.get().checkInterval * 1000);
	});
}

function checkFinished() {
	if (!config.get().removeFinishedDays)
		return;
		
	var now = new Date();
	var deleteDate = new Date(now);
    deleteDate.setDate(now.getDate() - config.get().removeFinishedDays);

	Item.find({state : ItemStates.finished, createdAt : {$lt : deleteDate.toJSON()}}, function(err, items) {
		if (err) {
			console.log(err);
		} else {		
			for (var index in items) {
				var item = items[index];
				
				console.log('Removing finished ' + item.name);
				
				item.remove(function(err) {
					if (err)
						console.log(err);
				});
			}
		}
	});
}

module.exports = check;