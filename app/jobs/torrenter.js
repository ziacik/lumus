var Transmission = require('transmission');
var Q = require('q');

var url = require('url');

var path = require('path');
var config = require('../config');
var labels = require('../labels');
var notifier = require('./notifier');

config.add('transmission', { type : 'literal', store : { 'downloader:transmission:url' : 'http://localhost:9091', 'downloader:removeTorrent' : true }});
labels.add({
	downloader : '<span class="fa fa-download" /> Downloaders',
	transmission : 'Transmission',
	removeTorrent : 'Remove Torrent <em><small>from downloader when finished</small></em>',
	'downloader:transmission:url' : 'Transmission Url'
});

var convertErr = function(err) {
	if (err.code === 'ECONNREFUSED') {
		return new Error('Unable to add item to torrent client. Is it running?');
	} else {
		return err;
	}
}

var checkFinished = function(item) {
	var deferred = Q.defer();
	var transmission = getTransmission();
	
	transmission.get(item.torrentHash, function(err, result) {
		if (err) {
			deferred.reject(convertErr(err));
			return;
		}
		
		if (result.torrents.length == 0) {
			item.state = 'Wanted';
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
		return Q(undefined);
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
	
	item.state = 'Downloaded';
	
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
			err = convertErr(err);
			console.log(err);
			item.rescheduleNextHour();
			deferred.reject(err);
			
			return;
		}
		
		var changes = {
			state : 'Downloading'
		};

		item.state = 'Downloading';
//		item.stateInfo = null;
//		item.torrentHash = result.hashString;				
//		item.torrentInfoUrl = torrentPageUrl;

//		if (!item.torrentLinks) {
//			item.torrentLinks = [];
//		}

		//item.torrentLinks.push(magnetLink);

		if (notifier) {
			notifier.notifySnatched(item);
		}

		console.log('Success. Torrent hash ' + item.torrentHash + '.');

		//TODO item.planNextCheck(1); /// To cancel possible postpone.
		ItemBase.update(item.id).set(changes).exec(function(err, updated) {
			if (err) {
				console.error(err);
				deferred.reject(err);
			}
			
			console.log(updated, 'GONNA publish');
			changes.id = item.id;
			ItemBase.publishUpdate(item.id, changes);
			deferred.resolve();			
		});
		//TODO item.save().then(deferred.resolve, deferred.reject);
	});
	
	return deferred.promise;
};


module.exports.add = add;
module.exports.checkFinished = checkFinished;
module.exports.removeTorrent = removeTorrent;
