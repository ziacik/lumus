var Transmission = require('transmission');
var Q = require('q');

var url = require('url');

var path = require('path');
var config = require('../config');
var labels = require('../labels');
var notifier = require('./notifier');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

config.add('transmission', { type : 'literal', store : { 'downloader:transmission:url' : 'http://localhost:9091', 'downloader:removeTorrent' : true }});
labels.add({
	downloader : '<span class="fa fa-download" /> Downloaders',
	transmission : 'Transmission',
	removeTorrent : 'Remove Torrent <em><small>from downloader when finished</small></em>',
	'downloader:transmission:url' : 'Transmission Url'
});

var checkFinished = function(item) {
	var deferred = Q.defer();
	var transmission = getTransmission();
	
	transmission.get(item.torrentHash, function(err, result) {
		if (err) {
			deferred.reject(err);
			return;
		}
		
		if (result.torrents.length == 0) {
			item.state = ItemStates.wanted;
			item.save().then(deferred.resolve, deferred.reject);
			return;
		}
		
		var torrent = result.torrents[0];
				
		if (torrent.isFinished) {
			finishItem(item, torrent).then(function() {
				if (config.get().downloader.removeTorrent) {
					return removeTorrent(item);
				}
			}).then(deferred.resolve, deferred.reject);
		} else {
			deferred.resolve();
		};
	});
	
	return deferred.promise;
}

var removeTorrent = function(item, removeData) {
	if (!item.torrentHash) {
		return;
	}

	var transmission = getTransmission();
	var remove = Q.nbind(transmission.remove, transmission);

	return remove([item.torrentHash], removeData)
}

var finishItem = function(item, torrent) {
	var filesInfo = torrent.files;
	
	var maxLength = 0;
	var maxFileInfo;
	
	for (var i = 0; i < filesInfo.length; i++) {
		var fileInfo = filesInfo[i];
		if (fileInfo.length > maxLength) {
			maxLength = fileInfo.length;
			maxFileInfo = fileInfo;
		}
	}
	
	var fileDir = path.dirname(maxFileInfo.name);
	var fileName = path.basename(maxFileInfo.name); 

	item.downloadDir = path.join(torrent.downloadDir, fileDir);
	item.mainFile = fileName;				
	
	item.state = ItemStates.downloaded;
	
	return item.save().then(function() {
		if (notifier)
			return notifier.notifyDownloaded(item);
	});
}

var _transmission;
var _transmissionUrl;


var getTransmission = function() {
	if (_transmission && config.get().downloader.transmission.url === _transmissionUrl)
		return _transmission;
		
	var transmissionUrl = config.get().downloader.transmission.url;

	var parsedUrl = url.parse(transmissionUrl, false, true);	
	var transmission = new Transmission({
		host : parsedUrl.hostname,
		port : parsedUrl.port
	});
	
	_transmission = transmission;
	_transmissionUrl = transmissionUrl;

	return transmission;
}

var add = function(item, magnetLink, torrentPageUrl) {
	var transmission = getTransmission();
	var deferred = Q.defer();
	
	/// Item already has a torrent, remove it first (with data too).
	removeTorrent(item, true);

	transmission.addUrl(magnetLink, function(err, result) {
		if (err) {
			console.log(err);
			
			var reason = err.syscall + ' ' + err.code;
			
			if (reason !== item.stateInfo) {
				item.stateInfo = reason;
				item.save();
			}
			
			deferred.reject(err);
			
			return; //TODO reschedule?
		}

		item.state = ItemStates.snatched;
		item.stateInfo = null;
		item.torrentHash = result.hashString;				
		item.torrentInfoUrl = torrentPageUrl;

		if (!item.torrentLinks) {
			item.torrentLinks = [];
		}

		item.torrentLinks.push(magnetLink);

		if (notifier)
			notifier.notifySnatched(item);

		console.log('Success. Torrent hash ' + item.torrentHash + '.');

		item.planNextCheck(1); /// To cancel possible postpone.

		item.save().then(deferred.resolve, deferred.reject);
	});
	
	return deferred.promise;
};


module.exports.add = add;
module.exports.checkFinished = checkFinished;
module.exports.removeTorrent = removeTorrent;
