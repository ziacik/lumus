var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var config = require('../config');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

var notifier;

var transmissionSessionId;
var torrentAddTries = 5;

function findTorrent(item) {
	console.log("Searching for " + item.name);
	
	var query = encodeURIComponent(item.name);
	var url = config.torrentSearchUrl.replace('${query}', query);

	request(url, function(err, resp, body) {
		console.log(url + " done");

		if (err) {
			console.log(err);
			//TODO done(err); 
			item.state = ItemStates.wanted;
			item.planNextCheck(config.defaultInterval);
			item.save(function(err) {
				if (err)
					console.log(err);
			});
			return;
		}

		$ = cheerio.load(body);					
		fetchBestMovieResult(item, $(".detName"));
	});	
}

function checkFinished(item) {
	var rpc = {};
	rpc.arguments = {};
	rpc.method = 'torrent-get';
	rpc.arguments.ids = [ item.torrentHash ];
	rpc.arguments.fields = [ 'isFinished', 'downloadDir', 'files', 'name' ];
	
	var options = {
		url : 'http://localhost:9091/transmission/rpc',
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
				
				for (var index in filesInfo) {
					var fileInfo = filesInfo[index];
					if (fileInfo.length > maxLength) {
						maxLength = fileInfo.length;
						maxFileInfo = fileInfo;
					}
				}
				
				console.log(torrentInfo);

				var fileDir = path.dirname(maxFileInfo.name);
				var fileName = path.basename(maxFileInfo.name); 

				item.downloadDir = path.join(torrentInfo.downloadDir, fileDir);
				//TODO item.mainFile = fileName;				
				
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

function fetchBestMovieResult(item, $rootElements) {
	if ($rootElements.length == 0) {
		console.log("No result for " + item.name + ", rescheduling (1 day)."); //TODO should be like 1 day or what.
		item.planNextCheck(24*3600);
		item.save(function(err) {}); //TODO err
		return;
	}
	
	doNext(item, $rootElements, 0);
}

function doNext(item, rootElements, index) {
	if (index >= rootElements.length) {
		console.log('No result matches filters. Rescheduling in 1 day.'); //TODO better log
		item.planNextCheck(24*3600);
		item.save(function(err) {}); //TODO log
		return;
	}

	var rootElement = rootElements[index];
	
	var $descElement = $(rootElement).siblings('font');
	var desc = $descElement.text();
	
	console.log("Desc-->" + desc + "<--");
	
	var sizeMatches = desc.match(/([0-9]+[.]?[0-9]*)[^0-9]+(KiB|MiB|GiB)/); //todo rewise
	
	if (sizeMatches == null || sizeMatches.length < 3) {
	 	console.log('Reached size limit'); //TODO better log
		doNext(item, rootElements, index + 1);
		return;
	}
	 
	console.log("Matches: " + sizeMatches);
	
	var size = parseFloat(sizeMatches[1]);
	
	if (sizeMatches[2] === 'GiB')
		size = size * 1000;
	else if (sizeMatches[2] === 'KiB')
		size = size / 1000;
				
	console.log('Size: ' + size);
		
	if (size > config.movieSizeLimit) {
		console.log('Reached size limit'); //TODO better log
		doNext(item, rootElements, index + 1);
		return;
	}
	
	var url = 'http://thepiratebay.se' + $(rootElement).children('.detLink').attr('href');
	console.log(url);
	
	request(url, function(error, response, body) {
		console.log(url + " done");

		if (error) {
			console.log(error);
			return;
		}
		
		$ = cheerio.load(body);					
		var nfo = $('.nfo').text();
		var comments = $('#comments').text().toLowerCase();
		
		var isGoodKeywords = true; 
		
		for (var index in config.movieRequiredKeywords) {
			isGoodKeywords = nfo.indexOf(config.movieRequiredKeywords[index]) >= 0;
			if (isGoodKeywords)
				break;
		}
		var isNotShit = comments.indexOf('shit') < 0 && comments.indexOf('crap') < 0 && comments.indexOf('hardcoded') < 0  && comments.indexOf('hard coded') < 0; 				
				
		if (isGoodKeywords && isNotShit) {
			addTorrent(item, $(rootElement).next().attr('href'));
		} else {	
			if (index < rootElements.length) {
				doNext(item, rootElements, index + 1);
			}
		}
	});
}

function addTorrent(item, magnetLink) {	
	var rpc = {};
	rpc.arguments = {};
	rpc.method = 'torrent-add';
	rpc.arguments.filename = magnetLink;
	
	var options = {
		url : 'http://localhost:9091/transmission/rpc',
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
			tryAgainOrFail(function() { addTorrent(item, magnetLink); }, "Too many tries, getting error, giving up.");
			return;
		}
		
		if (response.statusCode == 409) {
			transmissionSessionId = response.headers['x-transmission-session-id'];
			tryAgainOrFail(function() { addTorrent(item, magnetLink); }, "Too many tries, getting 409, giving up.");
			return;
		}			

		console.log(body);

		item.planNextCheck(config.defaultInterval);

		if (body.result === 'success') {		
			item.state = ItemStates.snatched;
			item.torrentHash = body.arguments['torrent-added'].hashString;
			
			if (notifier)
				notifier.notifySnatched(item);
				
			console.log('Success. Torrent hash ' + item.torrentHash + '.');
		} else {
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

function setNotifier(notifierToSet) {
	notifier = notifierToSet;
}

module.exports.findTorrent = findTorrent;
module.exports.checkFinished = checkFinished;
module.exports.setNotifier = setNotifier;