var torrenter = require('./torrenter');
var renamer = require('./renamer');
var subtitler = require('./subtitler');
var notifier = require('./notifier');
var xbmc = require('./xbmc');

var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

notifier.use(xbmc);
torrenter.setNotifier(notifier);

function check() {
	Item.find({nextCheck : {$lte : new Date().toJSON()}, $where : function() { return this.lastCheck < this.nextCheck; }}, function(err, items) {
		if (err) {
			console.log(err);
			return;
		}
		
		for (var index in items) {
			var item = items[index];
			
			console.log('Checking ' + item.name);

			item.lastCheck = new Date().toJSON();
			item.save(function(err) {});
			
			if (item.state === ItemStates.wanted)
				torrenter.findTorrent(item);
			else if (item.state === ItemStates.snatched)
				torrenter.checkFinished(item);
			else if (item.state === ItemStates.downloaded)
				renamer.rename(item);
			else if (item.state === ItemStates.renamed)
				subtitler.findSubtitles(item);
			else if (item.state === ItemStates.subtitled)
				notifier.updateLibrary(item.type);
			else
				console.log('Invalid state ' + item.state);
		}
	});
}

module.exports = check;