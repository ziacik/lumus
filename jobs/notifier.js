var services = [];

function use(service) {
	services.push(service);
}

function notifySnatched(item) {
	withAllServices(function(service) {
		service.notifySnatched(item);
	});
}

function notifyDownloaded(item) {
	withAllServices(function(service) {
		service.notifyDownloaded(item);
	});
}

function updateLibrary(type) {
	withAllServices(function(service) {
		service.updateLibrary(type);
	});
}

function withAllServices(doWhat) {
	for (var index in services) {
		var service = services[index];
		
		doWhat(service);
	};	
}

module.exports.use = use;
module.exports.notifySnatched = notifySnatched;
module.exports.notifyDownloaded = notifyDownloaded;
module.exports.updateLibrary = updateLibrary;
