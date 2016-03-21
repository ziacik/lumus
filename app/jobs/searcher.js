var Promise = require('bluebird');
var torrenter = require('./torrenter');
var serviceDispatcher = require('./serviceDispatcher');
var filter = require('./filter');
var decorator = require('./decorator');
var labels = require('../labels');

module.exports = serviceDispatcher.create('searchers');

labels.add({
	searcher : '<span class="fa fa-search" /> Searchers'
});

module.exports.findIfExists = function(item) {
	return module.exports.findAll(item)
	.then(function(results) {
		if (results.length === 0) {
			return Promise.resolve(false);
		} else {
			return filter.first(item, results);
		}
	}).catch(function(errors) {
		if (!errors.length) {
			errors = [ errors ];
		}

		var stack = errors.map(function(error) {
			return error.stack || error.message;
		}).join(require('os').EOL);

		var messages = errors.map(function(error) {
			return error.message || error;
		}).join(', ');

		console.error('Error in searcher. Caused by: ' + stack);
	});
};

module.exports.findAndAdd = function(item) {
	var hasResults;

	return item.setState('Searching').saveAndPublish().then(function() {
		return module.exports.findAll(item);
	}).then(function(results) {
		hasResults = results.length > 0;
		if (hasResults) {
			return filter.first(item, results);
		} else {
			return item.setState('Wanted').setInfo('Nothing found.').rescheduleNextDay().then(function(whatever) {
				return Promise.resolve();
			});
		}
	}).then(function(result) {
		if (result) {
			return torrenter.add(item, result.magnetLink, result.torrentInfoUrl);
		} else if (hasResults) {
			return item.setState('Wanted').setInfo('No result matched filters.').rescheduleNextDay();
		} else {
			return Promise.resolve();
		}
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
};
