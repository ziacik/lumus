var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var config = require('../config');
var notifier = require('./notifier');

var showSearcher = require('./showSearcher');
var movieSearcher = require('./movieSearcher');
var musicSearcher = require('./musicSearcher');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

var transmissionSessionId;
var torrentAddTries = 5;

function findTorrent(item) {
	if (item.type === ItemTypes.movie)
		movieSearcher.searchFor(item);
	else if (item.type === ItemTypes.show)
		showSearcher.searchFor(item);
	else if (item.type === ItemTypes.music)
		musicSearcher.searchFor(item);
	else		
		console.log("Not supported.");
}

function checkFinished(item) {
	var rpc = {};
	rpc.arguments = {};
	rpc.method = 'torrent-get';
	rpc.arguments.ids = [ item.torrentHash ];
	rpc.arguments.fields = [ 'isFinished', 'downloadDir', 'files', 'name' ];
	
	var options = {
		url : config.transmissionUrl + '/transmission/rpc',
		method : 'POST',
		json : rpc,
		headers : {
			'X-Transmission-Session-Id' : transmissionSessionId
		}
	};

	console.log(options.url);
	
	request(options, function(error, response, body) {
		console.log(options.url + " done");

		if (error) {
			console.log(error);
			item.planNextCheck(config.defaultInterval);
			item.save(function(err) {});
			return;
		}
		
		if (response.statusCode == 409) {
			transmissionSessionId = response.headers['x-transmission-session-id'];
			tryAgainOrFail(function() { checkFinished(item); }, "Too many tries, getting 409, giving up.");
			return;
		}			

		console.log(body);
		
		if (body.result !== 'success') {
		
			console.log('Not success. What do?'); //TODO
			item.planNextCheck(config.defaultInterval);
		
		} else {
				
			if (body.arguments.torrents.length == 0) {
			
				console.log('Torrent removed.');
				item.state = ItemStates.wanted;
				item.planNextCheck(config.defaultInterval);
						
			} else if (body.arguments.torrents[0].isFinished) {

				var torrentInfo = body.arguments.torrents[0];
				var filesInfo = torrentInfo.files;
				
				var maxLength = 0;
				var maxFileInfo;
				
				for (var i = 0; i < filesInfo.length; i++) {
					var fileInfo = filesInfo[i];
					if (fileInfo.length > maxLength) {
						maxLength = fileInfo.length;
						maxFileInfo = fileInfo;
					}
				}
				
				console.log(torrentInfo);

				var fileDir = path.dirname(maxFileInfo.name);
				var fileName = path.basename(maxFileInfo.name); 

				item.downloadDir = path.join(torrentInfo.downloadDir, fileDir);
				item.mainFile = fileName;				
				
				item.state = ItemStates.downloaded;
				item.planNextCheck(1); /// So that rename goes right on.				

				if (notifier)
					notifier.notifyDownloaded(item);
					
			} else {
				
				console.log(body.arguments.torrents[0].isFinished);
				item.planNextCheck(config.defaultInterval);
				
			}
			
		}
		
		console.log('Check finished for item ' + item.name + ', state: ' + item.state); 
		
		item.save(function(err) {
			if (err)
				console.log(err);
		});	
	});
}

function addTorrent(item, infoUrl, magnetLink) {	
	var rpc = {};
	rpc.arguments = {};
	rpc.method = 'torrent-add';
	rpc.arguments.filename = magnetLink;
	
	var options = {
		url : config.transmissionUrl + '/transmission/rpc',
		method : 'POST',
		json : rpc,
		headers : {
			'X-Transmission-Session-Id' : transmissionSessionId
		}
	};

	console.log(options.url);
	
	request(options, function(error, response, body) {
		console.log(options.url + " done");

		if (error) {
			console.log(error);
			tryAgainOrFail(function() { addTorrent(item, infoUrl, magnetLink); }, "Too many tries, getting error, giving up.");
			return;
		}
		
		if (response.statusCode == 409) {
			transmissionSessionId = response.headers['x-transmission-session-id'];
			tryAgainOrFail(function() { addTorrent(item, infoUrl, magnetLink); }, "Too many tries, getting 409, giving up.");
			return;
		}			

		console.log(body);

		item.planNextCheck(config.defaultInterval);

		if (body.result === 'success') {
			item.stateInfo = null;
			item.state = ItemStates.snatched;
			item.torrentHash = body.arguments['torrent-added'].hashString;
			item.torrentInfoUrl = infoUrl;
			
			if (!item.torrentLinks)
				item.torrentLinks = [];
				
			item.torrentLinks.push(magnetLink);
			
			if (notifier)
				notifier.notifySnatched(item);
				
			console.log('Success. Torrent hash ' + item.torrentHash + '.');
		} else {
			item.stateInfo = "Unable to add to transmission."
			console.log('No success. Sorry. Transmission down or what?');
		}
			
		item.save(function(err) {
			if (err)
				console.log(err);
		});
	});
}

function tryAgainOrFail(doWhat, message) {
	torrentAddTries--;
	
	if (torrentAddTries >= 0) {
		doWhat();
	} else {
		console.log(message);
		return;
	}
}

module.exports.findTorrent = findTorrent;
module.exports.checkFinished = checkFinished;
