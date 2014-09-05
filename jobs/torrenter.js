var Transmission = require('transmission');
var url = require('url');

var path = require('path');
var config = require('../config');
var notifier = require('./notifier');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

function checkFinished(item) {
	var transmission = getTransmission();
	
	transmission.get(item.torrentHash, function(err, result) {
		if (err) {
			//TODO probably should postpone the item a bit.
			console.log(err);
			return;
		}
		
		if (result.torrents.length == 0) {
			console.log('Torrent removed.');
			item.state = ItemStates.wanted;
			
			item.save(function(err) {
				if (err)
					console.log(err);
			});
			
			return;
		}
		
		if (result.torrents.length > 1) {
			console.log("Unexpected count of torrents returned from transmission.");			
			return;
		}
		
		var torrent = result.torrents[0];
				
		if (torrent.isFinished) {
			finishItem(item, torrent);
			
			if (config.removeTorrent)
				removeTorrent(item);
		}
										
		console.log('Check finished for item ' + item.name + ', state: ' + item.state); 		
	});
}

var removeTorrent = function(item) {
	var transmission = getTransmission();

	transmission.remove([item.torrentHash], false, function(err, arg) {
		if (err) {
			console.log('Unable to remove torrent: ' + err);
		}
	});
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
	
	//TODO should call renamer right away or what.
	item.save(function(err) {
		if (err)
			console.log(err);
	});	

	if (notifier)
		notifier.notifyDownloaded(item);
}

var _transmission;
var _transmissionUrl;


var getTransmission = function() {
	if (_transmission && config.transmissionUrl === _transmissionUrl)
		return _transmission;
		
	var transmissionUrl = config.transmissionUrl;

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
	
	/// Item already has a torrent, remove it first.
	if (item.torrentHash)
		removeTorrent(item);

	transmission.addUrl(magnetLink, function(err, result) {
		if (err) {
			console.log(err);
			item.stateInfo = err.syscall + ' ' + err.code;
			item.save(function(err) {
				console.log(err);
			});
			return; //TODO reschedule?
		}

		item.state = ItemStates.snatched;
		item.stateInfo = null;
		item.torrentHash = result.hashString;				
		item.torrentInfoUrl = torrentPageUrl;

		if (!item.torrentLinks)
			item.torrentLinks = [];

		item.torrentLinks.push(magnetLink);

		if (notifier)
			notifier.notifySnatched(item);

		console.log('Success. Torrent hash ' + item.torrentHash + '.');

		item.planNextCheck(1); /// To cancel possible postpone.

		item.save(function(err) {
			if (err)
				console.log(err);
		});			
	});
};


module.exports.add = add;
module.exports.checkFinished = checkFinished;
