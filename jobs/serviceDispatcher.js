var Q = require('q');

module.exports.ServiceDispatcher = function() {
	this.services = [];
};

module.exports.ServiceDispatcher.prototype.use = function(service) {
	this.services.push(service);
};

module.exports.ServiceDispatcher.prototype.forAll = function(command) {
	return Q.all(this.services.map(function(service) {
		return function() {
			return command(service);
		};
	}));
};

module.exports.ServiceDispatcher.prototype.untilSuccess = function(command) {
	var deferred = Q.defer();
	var serviceIndex = 0;
	var services = this.services;
	
	function loop() {
		if (services.length <= serviceIndex) {
			return Q.resolve(undefined);			
		}
	
		var service = services[serviceIndex];
		serviceIndex++;

		console.log('Trying service ' + service.name);		
		
		Q.when(command(service), function(result) {
			if (result) {
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