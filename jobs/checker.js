var torrenter = require('./torrenter');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

function check() {
	Item.find({lastCheck : {$lt : nextCheck}, nextCheck : {$lte : new Date().toJSON()}}, function(err, items) {
		if (err) {
			console.log(err);
			return;
		}
		
		for (var index in items) {
			var item = items[index];

			item.lastCheck = new Date().toJSON();
			item.save(function(err) {});
			
			if (item.state === ItemStates.wanted)
				torrenter.findTorrent(item);
			else if (item.state === ItemStates.snatched)
				torrenter.checkFinished(item);
			else
				console.log('Invalid state ' + item.state);
		}
	});
}

module.exports = check;