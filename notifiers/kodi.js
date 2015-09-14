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

module.exports.notifySnatched = function(item) {
	return doStuff(function(connection) {
		return connection.GUI.ShowNotification('Snatched', item.name, 'info');
	});
}

module.exports.notifyDownloaded = function(item) {
	return doStuff(function(connection) {
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
	return doStuff(function(connection) {
		return connection.AudioLibrary.Scan();
	});
};

var updateVideoLibrary = function(item) {
	return doStuff(function(connection) {
		return connection.VideoLibrary.Scan();
	});
};

function doStuff(what) {
	var options = config.get().notifier.kodi;	
	return kodi(options.host, options.port).then(function(connection) {
		return what(connection);
	});
}