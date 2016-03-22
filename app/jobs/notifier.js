var util = require('util');

var labels = require('../labels');
var serviceDispatcher = require('./serviceDispatcher');

labels.add({ notifier : '<span class="fa fa-bell" /> Notification & Library' });

module.exports = serviceDispatcher.create();

module.exports.notifySnatched = function(item) {
	return this.forAll(function(service) {
		return service.notifySnatched(item);
	});
}

module.exports.notifyDownloaded = function(item) {
	return this.forAll(function(service) {
		return service.notifyDownloaded(item);
	});
}

module.exports.updateLibrary = function(item) {
	return this.forAll(function(service) {
		return service.updateLibrary(item).then(function() {
			return item.setState('Subtitling').saveAndPublish();
		});
	});
}
