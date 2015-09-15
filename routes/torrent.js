var util = require('util');
var Item = require('../models/item').Item;
var searcher = require('../jobs/searcher');
var torrenter = require('../jobs/torrenter');

exports.list = function(req, res){
	return Item.findById(req.query.id).then(function(item) {
		if (!item) {
			res.send(404);
		} else {
			var searchNowClicked = req.query.reset ||  req.query.what;
		
			if (req.query.reset) {
				delete item.searchTerm;
			} else if (req.query.what && item.searchTerm !== req.query.what) {
				item.searchTerm = req.query.what;				
			}
			
			if (item.searchResults && !searchNowClicked) {
				res.render('torrents', { item : item, results : item.searchResults, searchTerm : item.searchTerm || item.name });
			} else {
				return searcher
				.findAll(item)
				.then(function(decoratedResults) {
					item.searchResults = decoratedResults;
					item.save();
					res.render('torrents', { item : item, results : decoratedResults, searchTerm : item.searchTerm || item.name });
				});
			};
		}
	})
	.catch(function(error) {
		util.error(error.stack || error);
		res.render('error', { error : error });
	});
};

exports.add = function(req, res) {
	return Item.findById(req.query.id).then(function(item) {
		return torrenter
		.add(item, req.query.magnet, req.query.page)
		.then(function() {
			res.redirect('/');
		});
	})
	.catch(function(error) {
		util.error(error.stack || error);
		res.render('error', { error : error });
	});
}