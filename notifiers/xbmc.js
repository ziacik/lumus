var Q = require('q');
var request = Q.denodeify(require('request'));
var config = require('../config');
var util = require('util');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;

module.exports.play = function(path) {
	return doRpc('{"jsonrpc":"2.0", "method":"Player.Open", "params":{"item":{"file":"' + path + '"}}}');
}

function notifySnatched(item) {
	doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Snatched", "message":"' + item.name + '","image":"info"}}').done();
}

function notifyDownloaded(item) {
	doRpc('{"jsonrpc":"2.0", "method":"GUI.ShowNotification", "params":{"title":"Downloaded", "message":"' + item.name + '","image":"info"}}').done();
}

function updateLibrary(item) {
	if (item.type === ItemTypes.music) {
		doRpc('{"jsonrpc":"2.0", "method":"AudioLibrary.Scan"}');
	} else {
		doRpc('{"jsonrpc":"2.0", "method":"VideoLibrary.Scan"}');
	}
}

function doRpc(payLoad) {
	var url = "http://" + config.xbmcHost + "/jsonrpc?request=" + encodeURIComponent(payLoad);
	return request(url).then(function() {
		return true;
	}).catch(function(err) {
		util.error(err);
		return false;
	});
}

module.exports.notifySnatched = notifySnatched;
module.exports.notifyDownloaded = notifyDownloaded;
module.exports.updateLibrary = updateLibrary;
