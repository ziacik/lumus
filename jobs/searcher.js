var util = require('util');
var Q = require('q');
var ItemStates = require('../models/item').ItemStates;
var torrenter = require('./torrenter');
var serviceDispatcher = require('./serviceDispatcher');
var filter = require('./filter');
var decorator = require('./decorator');
var labels = require('../labels');

module.exports = new serviceDispatcher.ServiceDispatcher();

labels.add({
	searcher : '<span class="fa fa-search" /> Searchers'
});

module.exports.findAndAdd = function(item) {
	module.exports.findAll(item).then(function(results) {
		if (results.length === 0) {
			item.stateInfo = "No results.";
		}
		return filter.first(item, results);
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
		util.error(error.stack || error);
		item.stateInfo = error.message || error;
		item.rescheduleNextHour();
	});
}

module.exports.findAll = function(item) {
	return this.forAll(function(service) {
		return service.searchFor(item).then(function(results) {
			return decorator.all(item, results);
		}).then(function(results) {
			return filter.all(item, results);
		}).then(function(results) {
			results.forEach(function(result) {
				result.serviceName = service.name;
			});
			return results;
		});
	}).then(function(serviceResults) {
		var results = serviceResults.reduce(function(previous, current, index, array) {
			return previous.concat(current);
		}, []);
		
		results.sort(function(result1, result2) {
			if (result1.score != result2.score) {
				return result2.score - result1.score;
			}
			
			if (result1.seeds != result2.seeds) {
				return result2.seeds - result1.seeds;
			}

			if (result1.leechs != result2.leechs) {
				return result2.leechs - result1.leechs;
			}

			return 0;
		});
		
		return results;
	});
}