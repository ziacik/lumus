var ItemStates = require('../models/item').ItemStates;
var torrenter = require('./torrenter');

var services = [];

function use(service) {
	services.push(service);
}

function searchFor(item) {
	withServicesUntilSuccess(function(service, isDoneCallback) {
		service.searchFor(item, function(results, err) {
			if (err) {
				console.log(err);
			}
			
			if (results) {
				console.log('Found ' + results.length);
				
				if (results.length > 0) {
					torrenter.add(item, results[0].magnetLink);
				} else {
					//TODO no results, postopne
				}
			}
			
			if (err || results) {
				isDoneCallback(true);
			} else {
				isDoneCallback(false);
			}
		});
	}, function() {
		console.log('None found.'); //TODO
	});
}

function withServicesUntilSuccess(callback, noSuccessCallback, serviceNo) {
	if (serviceNo === undefined) {
		serviceNo = 0;
	}
	
	if (serviceNo >= services.length) {
		noSuccessCallback();
		return;
	}
		
	var service = services[serviceNo];
	callback(service, function(isDone) {
		if (!isDone) {
			withServicesUntilSuccess(callback, noSuccessCallback, serviceNo + 1);
		}
	});	
}

module.exports.use = use;
module.exports.searchFor = searchFor;