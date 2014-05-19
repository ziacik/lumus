var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var config = require('../config');
var notifier = require('./notifier');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

var transmissionSessionId;
var torrentAddTries = 5;

function searchFor(item) {
	console.log("Searching for " + item.name);
	
	var query = encodeURIComponent(item.name);
	var url = config.musicSearchUrl.replace('${query}', query);

	request(url, function(err, resp, body) {
		console.log(url + " done");

		if (err) {
			console.log(err);
			//TODO done(err); 
			item.stateInfo = err;
			item.state = ItemStates.wanted;
			item.planNextCheck(config.defaultInterval);
			item.save(function(err) {
				if (err)
					console.log(err);
			});
			return;
		}

		$ = cheerio.load(body);
		fetchBestResult(item, $(".detName"));
	});
}

function fetchBestResult(item, $rootElements) {
	if ($rootElements.length == 0) {
		console.log("No result for " + item.name + ", rescheduling (1 day)."); //TODO should be like 1 day or what.
		item.stateInfo = "No result, rescheduled for tommorow."
		item.planNextCheck(24*3600);
		item.save(function(err) {}); //TODO err
		return;
	}
	
	doNext(item, $rootElements, 0);
}

function doNext(item, rootElements, elementIndex) {
	console.log('DoNext ' + elementIndex);

	if (elementIndex >= rootElements.length) {
		console.log('No result matches filters. Rescheduling in 1 day.'); //TODO better log
		item.stateInfo = "No result matched filters, rescheduled for tommorow."
		item.planNextCheck(24*3600);
		item.save(function(err) {}); //TODO log
		return;
	}

	var rootElement = rootElements[elementIndex];
	
	var itemTitle = $(rootElement).children('.detLink').attr('title');
	
	var magnetLink = $(rootElement).next().attr('href');
	
	if (item.torrentLinks) {
		console.log('Checking torrent links');
		console.log('Comparing ' + magnetLink);
	
		for (i = 0; i < item.torrentLinks.length; i++) {
			console.log('With ' + item.torrentLinks[i]);

			if (item.torrentLinks[i] === magnetLink) {
				console.log("Torrent already used before, skipping to try next: " + magnetLink);
				doNext(item, rootElements, elementIndex + 1);
				return;
			}
		}
	}
	
	var $descElement = $(rootElement).siblings('font');
	var desc = $descElement.text();
		
	var sizeMatches = desc.match(/([0-9]+[.]?[0-9]*)[^0-9]+(KiB|MiB|GiB)/); //todo rewise
	
	if (sizeMatches == null || sizeMatches.length < 3) {
	 	console.log('Reached size limit'); //TODO better log
		doNext(item, rootElements, elementIndex + 1);
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
		doNext(item, rootElements, elementIndex + 1);
		return;
	}
	
	var url = 'https://thepiratebay.se' + $(rootElement).children('.detLink').attr('href');
	console.log(url);

	addTorrent(item, url, magnetLink);
}

function addTorrent(item, infoUrl, magnetLink) {	
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
			console.log('No success. Sorry. Transmission down or what?');
			item.stateInfo = "Unable to add to transmission."
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

module.exports.searchFor = searchFor;
