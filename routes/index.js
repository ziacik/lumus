var Item = require('../models/item').Item;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

/*
 * GET home page.
 */

exports.index = function(req, res){
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
};