var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var config = require('../config');
var notifier = require('./notifier');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

var Searcher = function(item) {
	this.torrentAddTries = 5;
	this.item = item;
	this.torrentInfo = {};	
};

Searcher.prototype.constructUrl = function() { };
Searcher.prototype.getSizeLimit = function() { };

Searcher.prototype.search = function() {
	console.log('Searching for item ' + this.item.name);
	
	this.searchUrl = this.constructUrl(this.item);
	
	request(this.searchUrl, function(err, resp, body) {
		if (err) {
			this.setError(err);
			return;
		}

		this.$ = cheerio.load(body);
		this.$resultElements = this.getResultElements();
		this.index = 0;
		
		this.nextResult();				
	}.bind(this));
};

Searcher.prototype.getResultElements = function() {
	return this.$('.detName');
};
	
Searcher.prototype.setError = function(err) {
	console.log(err);	
	
	this.item.stateInfo = err;
	this.item.state = ItemStates.wanted;
	
	this.item.save(function(err) {
		if (err)
			console.log(err); //TODO what do?
	});
};
	
Searcher.prototype.setFail = function(reason) {
	this.item.stateInfo = reason;
	this.item.planNextCheck(24*3600); //TODO hardcoded
	this.item.save(function(err) {
		if (err)
			console.log(err);
	});
};

Searcher.prototype.isUsedAlready = function(magnetLink) {
	if (!this.item.torrentLinks)
		return false;
		
	for (i = 0; i < this.item.torrentLinks.length; i++) {
		if (this.item.torrentLinks[i] === magnetLink)
			return true;			
	}
	
	return false;
};
	
Searcher.prototype.getSize = function() {
	var $descElement = this.$resultElement.siblings('font');
	var desc = $descElement.text();
		
	var sizeMatches = desc.match(/([0-9]+[.]?[0-9]*)[^0-9]+(KiB|MiB|GiB)/); // todo rewise
	
	if (sizeMatches == null || sizeMatches.length < 3) {		
	 	console.log('Unable to determine size.'); // TODO better handling
		return 1000000; // TODO bulgarian constant
	}		 		
	
	var size = parseFloat(sizeMatches[1]);
	
	if (sizeMatches[2] === 'GiB')
		size = size * 1000;
	else if (sizeMatches[2] === 'KiB')
		size = size / 1000;	
		
	return size;
};

Searcher.prototype.getName = function() {
	return this.$resultElement.children('.detLink').text();
};

Searcher.prototype.getPeers = function() {
	var $td = this.$resultElement.parent();
	var $seedersTd = $td.next();
	var $leechersTd = $seedersTd.next();
	
	return {
		seeds : $seedersTd.text() << 0,
		leechs : $leechersTd.text() << 0
	};
};

Searcher.prototype.noNextResult = function() {
	return this.index >= this.$resultElements.length;
};

Searcher.prototype.setNextResult = function() {
	if (this.noNextResult()) {
		this.setFail("No result matched filters, rescheduling for tommorow.");
		this.$resultElement = null;
	} else {	
		this.$resultElement = this.$(this.$resultElements[this.index]);
		this.index++;
	}
	
	return this.$resultElement;
};

Searcher.prototype.getMagnetLink = function() {
	return this.$resultElement.next().attr('href');
};

Searcher.prototype.getTorrentPageUrl = function() {
	return 'https://thepiratebay.se' + this.$resultElement.children('.detLink').attr('href'); //TODO
};

Searcher.prototype.nextResult = function() {
	if (!this.setNextResult())
		return;
		
	this.torrentInfo = {
		magnetLink : this.getMagnetLink(),
		name : this.getName(),
		size : this.getSize(),
		peers : this.getPeers(),
		torrentPageUrl : this.getTorrentPageUrl()
	};
		
	if (this.isUsedAlready(this.torrentInfo.magnetLink)) {
		this.skipTorrent('already tried before');
		return;
	}

	if (this.torrentInfo.size > this.getSizeLimit()) {
		this.skipTorrent('reached size limit');
		return;
	}

	this.finalize();
};
	
Searcher.prototype.finalize = function() {
	this.addTorrent();
};

Searcher.prototype.skipTorrent = function(reason) {
	this.nextResult();
};
	
Searcher.prototype.addTorrent = function() {
	var rpc = {};
	rpc.arguments = {};
	rpc.method = 'torrent-add';
	rpc.arguments.filename = this.torrentInfo.magnetLink;
	
	var options = {
		url : config.transmissionUrl + '/transmission/rpc',
		method : 'POST',
		json : rpc,
		headers : {
			'X-Transmission-Session-Id' : this.transmissionSessionId
		}
	};
	
	console.log(options.url);
	
	request(options, function(error, response, body) {
		console.log(options.url + " done");

		if (error) {
			console.log(error);
			this.tryAgainOrFail(function() { this.addTorrent(); }.bind(this), "Too many tries, getting error, giving up.");
			return;
		}
		
		if (response.statusCode == 409) {
			this.transmissionSessionId = response.headers['x-transmission-session-id'];
			this.tryAgainOrFail(function() { this.addTorrent(); }.bind(this), "Too many tries, getting 409, giving up.");
			return;
		}			

		console.log(body);

		if (body.result === 'success') {		
			this.item.state = ItemStates.snatched;
			this.item.torrentHash = body.arguments['torrent-added'].hashString;				
			this.item.torrentInfoUrl = this.torrentInfo.torrentPageUrl;
			
			if (!this.item.torrentLinks)
				this.item.torrentLinks = [];
				
			this.item.torrentLinks.push(this.torrentInfo.magnetLink);
			
			if (notifier)
				notifier.notifySnatched(this.item);
				
			console.log('Success. Torrent hash ' + this.item.torrentHash + '.');
			
			this.item.save(function(err) {
				if (err)
					console.log(err);
			});
		} else {
			console.log('No success. Sorry. Transmission down or what?');
			this.item.stateInfo = "Unable to add to transmission." //TODO should be reason?
		}
	}.bind(this));	
};
	
Searcher.prototype.tryAgainOrFail = function(doWhat, message) {
	this.torrentAddTries--;
	
	if (this.torrentAddTries >= 0) {
		doWhat();
	} else {
		console.log(message);
		return;
	}
};	

module.exports.Searcher = Searcher;