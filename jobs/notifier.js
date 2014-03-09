var ItemStates = require('../models/item').ItemStates;

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

function updateLibrary(item) {
	withAllServices(function(service) {
		service.updateLibrary(item);
	});
}

function withAllServices(doWhat) {
	for (var index in services) {
		var service = services[index];
		
		doWhat(service);
	};
	
	item.state = ItemStates.finished;
	item.save(function(err) {
		if (err) 
			console.log(err);
	});
}

module.exports.use = use;
module.exports.notifySnatched = notifySnatched;
module.exports.notifyDownloaded = notifyDownloaded;
module.exports.updateLibrary = updateLibrary;
