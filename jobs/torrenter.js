var request = require('request');
var cheerio = require('cheerio');
var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;
var transmissionSessionId;
var torrentAddTries = 5;

function findTorrent(item) {
	console.log("Searching for " + item.name);

	var url = "http://thepiratebay.se/search/" + item.name + "/0/7/207";

	request(url, function(err, resp, body) {
		console.log(url + " done");

		if (err) {
			console.log(err);
			//TODO done(err); 
			item.state = ItemStates.wanted;
			item.nextCheck = new Date(new Date().getTime() + 10000).toJSON(); //TODO hardcoded
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
	rpc.arguments.ids = [ item.torrentId ];
	rpc.arguments.fields = [ 'isFinished', 'downloadDir', 'files', 'name' ];
	
	var options = {
		url : 'http://malina:9091/transmission/rpc',
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
			item.nextCheck = new Date(new Date().getTime() + 10000).toJSON(); //TODO hardcoded
		} else {		
			if (body.arguments.torrents.length == 0) {
				console.log('Torrent removed.');
				item.state = ItemStates.wanted;
				item.nextCheck = new Date(new Date().getTime() + 10000).toJSON(); //TODO hardcoded		
			} else if (body.arguments.torrents[0].isFinished) {
				item.state = ItemStates.downloaded;				
			} else {
				console.log(body.arguments.torrents[0].isFinished);
				item.nextCheck = new Date(new Date().getTime() + 10000).toJSON(); //TODO hardcoded
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
	if ($rootElements.length == 0)
		return;
	
	doNext(item, $rootElements, 0);
}

function doNext(item, $rootElements, index) {
	var $rootElement = $rootElements[index];	
	
	var url = 'http://thepiratebay.se' + $($rootElement).children('.detLink').attr('href');
	console.log(url);
	
	request(url, function(error, response, body) {
		console.log(url + " done");

		if (error) {
			console.log(error);
			return;
		}
				
		if (true || body.indexOf('DTS') >= 0 || body.indexOf('AC3') >= 0 || body.indexOf('AC-3') >= 0) {
			addTorrent(item, $($rootElement).next().attr('href'));
		} else {	
			if (index < $rootElements.length) {
				doNext(item, $rootElements, index + 1);
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
		url : 'http://malina:9091/transmission/rpc',
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

		item.nextCheck = new Date(new Date().getTime() + 10000).toJSON(); //TODO hardcoded

		if (body.result === 'success') {		
			item.state = ItemStates.snatched;
			item.torrentId = body.arguments['torrent-added'].id;
			console.log('Success. Torrent id ' + item.torrentId + '.');
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

module.exports.findTorrent = findTorrent;
module.exports.checkFinished = checkFinished;