var Q = require('q');
var request = Q.denodeify(require('request'))
var config = require('../config');
var labels = require('../labels');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;

config.add('kodi', { type : 'literal', store : {'notifier:kodi:use' : true, 'notifier:kodi:url':'http://localhost:8080'}});
labels.add({ kodi : 'Kodi', 'notifier:kodi:url' : 'Kodi Url' });

module.exports.notifySnatched = function(item) {
	return doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Snatched", "message":"' + item.name + '","image":"info"}}');
}

module.exports.notifyDownloaded = function(item) {
	return doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Downloaded", "message":"' + item.name + '","image":"info"}}');
}

module.exports.updateLibrary = function(item) {
	if (item.type === ItemTypes.music) {
		return doRpc('{"jsonrpc":"2.0", "method":"AudioLibrary.Scan"}');
	} else {
		return doRpc('{"jsonrpc":"2.0", "method":"VideoLibrary.Scan"}');
	}
}

function doRpc(payLoad) {
	var url = config.get().notifier.kodi.url + "/jsonrpc?request=" + encodeURIComponent(payLoad);
	return request(url);
}