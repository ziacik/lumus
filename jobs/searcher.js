var Q = require('q');
var ItemStates = require('../models/item').ItemStates;
var torrenter = require('./torrenter');
var serviceManager = require('./serviceDispatcher');
var filter = require('./filter');

module.exports = new serviceManager.ServiceDispatcher();

module.exports.findOne = function(item) {
	this.untilSuccess(function(service) {
		return service.searchFor(item).then(function(results) {
			return filter.first(item, results);
		}); 
	}).then(function(result) {
		if (result) {
			torrenter.add(item, result.magnetLink, result.torrentInfoUrl);						
		} else {
			console.log('Not found.');
			//TODO reschedule
		}
	}).catch(function(error) {
		console.log(error); //TODO reschedule item?
	});
}

module.exports.findAll = function(item) {
	this.forAll(function(service) {
		return service.searchFor(item);
	}).then(function(results) {
		//TODO
	}).catch(function(error) {
		console.log(error); //TODO reschedule item?
	});
}
