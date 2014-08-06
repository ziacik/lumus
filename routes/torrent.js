var lister = require('../jobs/lister');
var Item = require('../models/item').Item;
var Searcher = require('../jobs/searcher').Searcher;

exports.list = function(req, res){
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else if (!item) {
			res.send(404);			
		} else {			
			lister.searchFor(item, function(results) {
				res.render('torrents', { item : item, results : results });
			});			
		}
	});
};

exports.add = function(req, res) {
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else {
			var searcher = new Searcher(item);
			searcher.torrentInfo.magnetLink = req.query.magnet;
			searcher.torrentInfo.torrentPageUrl = req.query.page;
			searcher.addTorrent(); //FIXME should be in torrenter, probably
			res.redirect('/');
		}
	});
}