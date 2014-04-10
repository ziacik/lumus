var itemRoute = require('./item');
var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;
var Music = require('../models/music').Music;

exports.list = function(req, res) {
	Item.getAll(function(err, items) {
		if (err) {
			res.render('error', {
				error: err
			});
		} else {
			res.render('list', {
				items: items,
				icons: ItemTypeIcons
			});		
		}
	});
};

exports.add = function(req, res) {
	itemRoute.add(req, res);
};
