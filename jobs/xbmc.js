var request = require('request');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;

function notifySnatched(item) {
	doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Snatched", "message":"' + item.name + '","image":"info"}}');
}

function notifyDownloaded(item) {
	doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Downloaded", "message":"' + item.name + '","image":"info"}}');
}

function updateLibrary(type) {
	if (type === ItemTypes.music) {
		doRpc('{"jsonrpc":"2.0", "method":"AudioLibrary.Scan", "params":{}');
	} else {
		doRpc('{"jsonrpc":"2.0", "method":"VideoLibrary.Scan", "params":{}');
	}
}

function doRpc(payLoad) {
	var url = "http://malina/jsonrpc?request=" + encodeURIComponent(payLoad);

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
