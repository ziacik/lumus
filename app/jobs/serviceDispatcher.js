var Promise = require('bluebird');
var util = require('util');

module.exports.create = function() {
	return new ServiceDispatcher();
};

function ServiceDispatcher() {
	this.services = [];
};

ServiceDispatcher.prototype.use = function(service) {
	this.services.push(service);
};

ServiceDispatcher.prototype.unuse = function(service) {
	var serviceIndex = this.services.indexOf(service);

	if (serviceIndex >= 0) {
		this.services.splice(serviceIndex, 1);
	}
};

ServiceDispatcher.prototype.forAll = function(command) {
	return Promise.mapSeries(this.services, command);
};

ServiceDispatcher.prototype.untilSuccess = function(command, isSuccess) {
	var serviceIndex = 0;
	var services = this.services;

	function loop() {
		if (services.length <= serviceIndex) {
			return;
		}

		var service = services[serviceIndex];
		serviceIndex++;

		return Promise.resolve(command(service)).then(function(result) {
			if (result && (!isSuccess || isSuccess(result))) {
				return result;
			} else if (serviceIndex < services.length) {
				return loop();
			} else {
				return;
			}
		});
	}

	return Promise.resolve(loop());
}
