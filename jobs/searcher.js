var util = require('util');
var Q = require('q');
var ItemStates = require('../models/item').ItemStates;
var torrenter = require('./torrenter');
var serviceDispatcher = require('./serviceDispatcher');
var filter = require('./filter');

module.exports = new serviceDispatcher.ServiceDispatcher();

module.exports.findAndAdd = function(item) {
	this.untilSuccess(function(service) {
		return service.searchFor(item).then(function(results) {
			if (results.length === 0) {
				item.stateInfo = "No results.";
			}
			return filter.first(item, results);
		});
	}).then(function(result) {
		if (result) {
			return torrenter.add(item, result.magnetLink, result.torrentInfoUrl);
		} else {
			//TODO Review. This check is due to possibility that it's already set to No results. But we should assure it gets cleared before next search.
			if (!item.stateInfo) {
				item.stateInfo = "No result matched filters.";
			}
			item.rescheduleNextDay();
		}
	}).catch(function(error) {
		util.error(error);
		item.stateInfo = error.message || error;
		item.rescheduleNextHour();
	});
}

module.exports.findAll = function(item) {
	return this.forAll(function(service) {
		return service.searchFor(item).then(function(results) {
			return filter.all(item, results);
		}).then(function(results) {
			return { serviceName : service.name, results : results };
		});
	});
}