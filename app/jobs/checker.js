var Promise = require('bluebird');
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
	return item.save();
}

function isAfterSubtitlerRetryLimit(item) {
	return false; //TODO Or?
}

function check() {
	console.log('CHECK');

	return checkActive().then(checkFinished).then(function() {
		console.log('NEXT CHECK', config.get().checkInterval * 1000);
		setTimeout(check, config.get().checkInterval * 1000);
	}).catch(function(error) {
		console.error(error.stack || error);
		setTimeout(check, config.get().checkInterval * 1000);
	});
}

function checkActive() {
	return ItemBase.find().where({
		state: {
			'!': ['Finished']
		},
		nextCheck: {
			'<': new Date().toJSON()
		}
	}).then(function(items) {
		console.error(items); //TODO remove
		return Promise.each(items, function(item) {
			return checkOne(item);
		});
	});
}

function checkFinished() {
	return checkFinishedToRemove().then(checkFinishedToNext);
}

function checkFinishedToNext() {
	return ItemBase.find({
		state: 'Finished',
		type: {
			$in: ['Season']
		},
		next: {
			$exists: false
		},
		nextCheck: {
			'<': new Date().toJSON()
		}
	}).then(function(items) {
		return Promise.each(items, function(item) {
			return nexter.checkNext(item).catch(function(err) {
				return handleItemError(err, item);
			});
		});
	})
}

function checkFinishedToRemove() {
	if (!config.get().removeFinishedDays) {
		return Promise.resolve();
	}

	var now = new Date();
	var deleteDate = new Date(now);
	deleteDate.setDate(now.getDate() - config.get().removeFinishedDays);

	return Item.find({
			state: ItemStates.finished,
			createdAt: {
				$lt: deleteDate.toJSON()
			},
			nextCheck: {
				'<': new Date().toJSON()
			}
		})
		.then(function(items) {
			return Promise.each(items, function(item) {
				return item.remove().catch(function(err) {
					return handleItemError(err, item);
				})
			});
		});
}

function checkOne(item) {
	return Promise.try(function() {
		if (item.state === 'Wanted' || item.state === 'Searching') {
			return searcher.findAndAdd(item);
		} else if (item.state === 'Downloading') {
			return torrenter.checkFinished(item);
		} else if (item.state === 'Renaming') {
			return renamer.rename(item);
		} else if (item.state === 'UpdatingLibrary') {
			return notifier.updateLibrary(item);
		} else if (item.state === 'Subtitling') {
			return subtitler.findSubtitles(item);
		}
	}).catch(function(err) {
		return handleItemError(err, item);
	})
}

function handleItemError(err, item) {
	console.error('Error in', item.name, err.stack || err);
	return item.setError(err).rescheduleNextHour();
}

configure();

module.exports.check = check;
module.exports.configure = configure;
