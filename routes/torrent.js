var lister = require('../jobs/lister');
var Item = require('../models/item').Item;
var Searcher = require('../jobs/searcher').Searcher;
var torrenter = require('../jobs/torrenter');

exports.list = function(req, res){
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else if (!item) {
			res.send(404);			
		} else {
			if (req.query.what) {
				item.searchTerm = req.query.what;
				item.save(function(err) {
					console.log(err);
				});
			}
		
			var concreteLister = lister.searchFor(item, function(results) {
				res.render('torrents', { item : item, results : results, searchTerm : concreteLister.getSearchTerm(item) });
			});			
		}
	});
};

exports.add = function(req, res) {
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else {
			torrenter.add(item, req.query.magnet, req.query.page);
			res.redirect('/');
		}
	});
}