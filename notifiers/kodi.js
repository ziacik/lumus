var request = require('request');
var config = require('../config');
var labels = require('../labels');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;

config.add('kodi', { type : 'literal', store : {'notifier:kodi:use' : true, 'notifier:kodi:url':'http://localhost:8080'}});
labels.add({ kodi : 'Kodi', 'notifier:kodi:url' : 'Kodi Url' });

function notifySnatched(item) {
	doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Snatched", "message":"' + item.name + '","image":"info"}}');
}

function notifyDownloaded(item) {
	doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Downloaded", "message":"' + item.name + '","image":"info"}}');
}

function updateLibrary(item) {
	if (item.type === ItemTypes.music) {
		doRpc('{"jsonrpc":"2.0", "method":"AudioLibrary.Scan"}');
	} else {
		doRpc('{"jsonrpc":"2.0", "method":"VideoLibrary.Scan"}');
	}
}

function doRpc(payLoad) {
	console.log(payLoad);
	var url = config.get().notifier.kodi.url + "/jsonrpc?request=" + encodeURIComponent(payLoad);
	console.log(url);

	request(url, function(err, resp, body) {
		console.log(url + " done");

		if (err) {
			console.log(err);
			return;
		}
	});		
}

module.exports.notifySnatched = notifySnatched;
module.exports.notifyDownloaded = notifyDownloaded;
module.exports.updateLibrary = updateLibrary;
