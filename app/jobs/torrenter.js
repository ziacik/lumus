var Promise = require('bluebird');
var Transmission = require('transmission');

Promise.promisifyAll(Transmission.prototype);

var url = require('url');

var path = require('path');
var config = require('../config');
var labels = require('../labels');
var notifier = require('./notifier');

config.add('transmission', {
	type: 'literal',
	store: {
		'downloader:transmission:url': 'http://localhost:9091',
		'downloader:removeTorrent': true
	}
});
labels.add({
	downloader: '<span class="fa fa-download" /> Downloaders',
	transmission: 'Transmission',
	removeTorrent: 'Remove Torrent <em><small>from downloader when finished</small></em>',
	'downloader:transmission:url': 'Transmission Url'
});

var convertErr = function(err) {
	if (err.code === 'ECONNREFUSED') {
		return new Error('Unable to add item to torrent client. Is it running?');
	} else {
		return err;
	}
}

var checkFinished = function(item) {
	var transmission = getTransmission();

	return transmission.getAsync(item.torrentHash).then(function(result) {
		if (result.torrents.length == 0) {
			return item.setState('Wanted').setInfo('Torrent removed.').saveAndPublish();
		}

		var torrent = result.torrents[0];

		if (torrent.isFinished) {
			return finishItem(item, torrent).then(function() {
				if (config.get().downloader.removeTorrent) {
					return removeTorrent(item);
				}
			});
		}
	});
}

var removeTorrent = function(item, removeData) {
	if (!item.torrentHash) {
		return Promise.resolve();
	}

	var transmission = getTransmission();
	return transmission.removeAsync([item.torrentHash], removeData)
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

	return item.setState('Renaming').saveAndPublish().then(function() {
		return notifier ? notifier.notifyDownloaded(item) : Promise.resolve();
	});
}

var _transmission;
var _transmissionUrl;


var getTransmission = function() {
	if (_transmission && config.get().downloader.transmission.url === _transmissionUrl) {
		return _transmission;
	}

	var transmissionUrl = config.get().downloader.transmission.url;

	var parsedUrl = url.parse(transmissionUrl, false, true);
	var transmission = new Transmission({
		host: parsedUrl.hostname,
		port: parsedUrl.port
	});

	_transmission = transmission;
	_transmissionUrl = transmissionUrl;

	return transmission;
}

var add = function(item, magnetLink, torrentPageUrl) {
	var transmission = getTransmission();

	/// Item already has a torrent, remove it first (with data too).
	return removeTorrent(item, true).then(function() {
		return transmission.addUrlAsync(magnetLink).then(function(result) {
			item.setState('Downloading');
			item.torrentHash = result.hashString;
			//		item.torrentInfoUrl = torrentPageUrl;

			//		if (!item.torrentLinks) {
			//			item.torrentLinks = [];
			//		}

			//item.torrentLinks.push(magnetLink);

			if (notifier) {
				//TODO add to chain
				notifier.notifySnatched(item);
			}

			return item.saveAndPublish();
		});
	});
};


module.exports.add = add;
module.exports.checkFinished = checkFinished;
module.exports.removeTorrent = removeTorrent;
