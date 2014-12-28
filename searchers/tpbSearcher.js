var torrenter = require('../jobs/torrenter');
var request = require('request');
var cheerio = require('cheerio');
var config = require('../config');
var notifier = require('./notifier');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;

var TpbSearcher = function(item) {
	this.item = item;
	this.torrentInfo = {};	
};

TpbSearcher.prototype.constructUrl = function() { };

TpbSearcher.prototype.search = function() {
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

TpbSearcher.prototype.getResultElements = function() {
	return this.$('.detName');
};
	
TpbSearcher.prototype.getSize = function() {
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

TpbSearcher.prototype.getName = function() {
	return this.$resultElement.children('.detLink').text();
};

TpbSearcher.prototype.getPeers = function() {
	var $td = this.$resultElement.parent();
	var $seedersTd = $td.next();
	var $leechersTd = $seedersTd.next();
	
	return {
		seeds : $seedersTd.text() << 0,
		leechs : $leechersTd.text() << 0
	};
};

TpbSearcher.prototype.noNextResult = function() {
	return this.index >= this.$resultElements.length;
};

TpbSearcher.prototype.setNextResult = function() {
	if (this.noNextResult()) {
		var lastCheckDateTime = new Date();
		var lastCheckDateTimeString = lastCheckDateTime.toLocaleDateString() + ' ' + lastCheckDateTime.toLocaleTimeString();
	
		if (this.index === 0)
			this.setFail("No result. Last checked at " + lastCheckDateTimeString + ".");
		else
			this.setFail("No result matched filters. Last checked at " + lastCheckDateTimeString + ".");
			
		this.$resultElement = null;
	} else {	
		this.$resultElement = this.$(this.$resultElements[this.index]);
		this.index++;
	}
	
	return this.$resultElement;
};

TpbSearcher.prototype.getMagnetLink = function() {
	return this.$resultElement.next().attr('href');
};

TpbSearcher.prototype.getTorrentPageUrl = function() {
	return 'https://thepiratebay.se' + this.$resultElement.children('.detLink').attr('href'); //TODO
};

module.exports.TpbSearcher = TpbSearcher;