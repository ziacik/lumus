var kodi = require('kodi-ws');
var config = require('../config');
var labels = require('../labels');

config.add('kodi', { type : 'literal', store : {'notifier:kodi:use' : true, 'notifier:kodi:host' : 'localhost', 'notifier:kodi:port' : '9090' }});
labels.add({
	kodi : 'Kodi',
	'notifier:kodi:url' : 'Kodi Url <em><small>Deprecated, please use Host and Port to EventServer</small></em>',
	'notifier:kodi:host' : 'Kodi Host',
	'notifier:kodi:port' : 'Kodi Port <em><small>EventServer</small></em>'
});

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
