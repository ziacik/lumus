var config = require('../config');
var Item = require('../models/item').Item;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

/*
 * GET home page.
 */

exports.index = function(req, res){
	if (config.get().version === 0) {
		res.redirect('/config');
	} else {
		Item.getAll(function(err, items) {
			if (err) {
				res.render('error', {
					error: err
				});
			} else {
				res.render('index', {
					title: 'lumus',
					items: items,
					icons: ItemTypeIcons
				});		
			}
		});
	}	
};