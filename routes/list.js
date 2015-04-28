var util = require('util');
var itemRoute = require('./item');
var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

exports.list = function(req, res) {
	return Item.getAll().then(function(items) {
		res.render('list', {
			items: items,
			icons: ItemTypeIcons
		});
	})
	.catch(function(error) {
		util.error(error.stack || error);
		res.render('error', {
			error: error
		});
	});
};

exports.add = function(req, res) {
	return itemRoute.add(req, res);
};