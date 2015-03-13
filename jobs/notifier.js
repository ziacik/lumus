var ItemStates = require('../models/item').ItemStates;
var labels = require('../labels');

labels.add({ notifier : '<span class="fa fa-bell" /> Notification & Library' });

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
	
	item.state = ItemStates.libraryUpdated;
	item.save(function(err) {
		if (err) 
			console.log(err);
	});	
}

function withAllServices(doWhat) {
	for (var index in services) {
		var service = services[index];
		console.log("Doing notification on service no " + index + ".");
		
		doWhat(service);
	};	
}

module.exports.use = use;
module.exports.notifySnatched = notifySnatched;
module.exports.notifyDownloaded = notifyDownloaded;
module.exports.updateLibrary = updateLibrary;
