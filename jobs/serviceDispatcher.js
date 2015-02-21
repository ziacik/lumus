var Q = require('q');
var util = require('util');

module.exports.ServiceDispatcher = function() {
	this.services = [];
};

module.exports.ServiceDispatcher.prototype.use = function(service) {
	this.services.push(service);
};

module.exports.ServiceDispatcher.prototype.forAll = function(command) {
	var promises = this.services.map(function(service) {
		return Q.fcall(command, service);
	});
	return Q.all(promises);
};

module.exports.ServiceDispatcher.prototype.untilSuccess = function(command, isSuccess) {
	var deferred = Q.defer();
	var serviceIndex = 0;
	var services = this.services;
	
	function loop() {
		if (services.length <= serviceIndex) {
			return Q.resolve(undefined);			
		}
	
		var service = services[serviceIndex];
		serviceIndex++;

		util.log('Trying service ' + service.name);		
		
		Q.when(command(service), function(result) {
			if (result && (!isSuccess || isSuccess(result))) {
				deferred.resolve(result);
			} else if (serviceIndex < services.length) {
				loop();
			} else {
				deferred.resolve(undefined);
			}
		}, deferred.reject);
	}
	
	Q.nextTick(loop);
	
	return deferred.promise;
}