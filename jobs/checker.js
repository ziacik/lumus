var config = require('../config');
var torrenter = require('./torrenter');
var movieSearcher = require('./movieSearcher');
var musicSearcher = require('./musicSearcher');
var showSearcher = require('./showSearcher');
var renamer = require('./renamer');
var subtitler = require('./subtitler');
var notifier = require('./notifier');
var xbmc = require('../notifiers/xbmc');
var opensubtitler = require('../subtitlers/opensubtitler');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;
var ItemTypes = require('../models/item').ItemTypes;

notifier.use(xbmc);
subtitler.use(opensubtitler);

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
	if (isMovie(item))
		movieSearcher.searchFor(item);
	else if (isShow(item))
		showSearcher.searchFor(item);
	else if (isMusic(item))
		musicSearcher.searchFor(item);
	else		
		console.log("Not supported.");
}

function check() {
	Item.find({state : {$nin : [ItemStates.finished, ItemStates.renameFailed]}, nextCheck : {$lte : new Date().toJSON()}}, function(err, items) {
		if (err) {
			console.log(err);
		} else {		
			for (var index in items) {
				var item = items[index];
				
				console.log('Checking ' + item.name);
				
				if (item.state === ItemStates.wanted)
					search(item);
				else if (item.state === ItemStates.snatched)
					torrenter.checkFinished(item);
				else if (item.state === ItemStates.downloaded)
					renamer.rename(item);
				else if (item.state === ItemStates.subtitlerFailed || (!isMusic(item) && item.state === ItemStates.renamed))
					subtitler.findSubtitles(item);
				else if (item.state === ItemStates.subtitled || (isMusic(item) && item.state === ItemStates.renamed))
					notifier.updateLibrary(item);
				else if (item.state === ItemStates.finished)
					console.log('Item ' + item.name + ' finished');
				else
					console.log('Invalid state ' + item.state);
			}
		}
		
		setTimeout(check, config.defaultInterval * 1000);
	});	
}

module.exports = check;