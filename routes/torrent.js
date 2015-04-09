var util = require('util');
var Item = require('../models/item').Item;
var searcher = require('../jobs/searcher');
var torrenter = require('../jobs/torrenter');

exports.list = function(req, res){
	return Item.findById(req.query.id).then(function(item) {
		if (!item) {
			res.send(404);
		} else {
			if (req.query.reset) {
				delete item.searchTerm;
				item.save();
			} else if (req.query.what) {
				item.searchTerm = req.query.what;
				item.save();
			}

			return searcher
			.findAll(item)
			.then(function(decoratedResults) {
				res.render('torrents', { item : item, results : decoratedResults, searchTerm : item.searchTerm || item.name });
			});
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