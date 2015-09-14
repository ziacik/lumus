var Q = require('q');
var kodi = require('kodi-ws');
var config = require('../config');
var labels = require('../labels');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;

config.add('kodi', { type : 'literal', store : {'notifier:kodi:use' : true, 'notifier:kodi:host' : 'localhost', 'notifier:kodi:port' : '9090' }});
labels.add({ 
	kodi : 'Kodi', 
	'notifier:kodi:url' : 'Kodi Url (Deprecated, please use Host and Port to EventServer)',
	'notifier:kodi:host' : 'Kodi Host',
	'notifier:kodi:port' : 'Kodi Port (EventServer)'
});

/// Kodi-ws library uses Promise which was introduced in node ~ v0.11 or so, so let's define it for legacy.
if (!global.Promise) {
	global.Promise = function(resolveRejectFunction) {
		var deferred = Q.defer();
		resolveRejectFunction(deferred.resolve, deferred.reject);
		return deferred.promise;
	}
}

module.exports.notifySnatched = function(item) {
	return connect().then(function(connection) {
		return connection.GUI.ShowNotification('Snatched', item.name, 'info');
	});
}

module.exports.notifyDownloaded = function(item) {
	return connect().then(function(connection) {
		return connection.GUI.ShowNotification('Downloaded', item.name, 'info');
	});
}

module.exports.updateLibrary = function(item) {
	if (item.type === ItemTypes.music) {
		return updateAudioLibrary(item);
	} else {
		return updateVideoLibrary(item);
	}
}

var updateAudioLibrary = function(item) {
	return connect().then(function(connection) {
		return connection.AudioLibrary.Scan();
	});
};

var updateVideoLibrary = function(item) {
	return connect().then(function(connection) {
		return connection.VideoLibrary.Scan();
	});
};

var connect = function() {	
	var options = config.get().notifier.kodi;	
	return kodi(options.host, parseInt(options.port));
}