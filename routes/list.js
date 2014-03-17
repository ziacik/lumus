var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

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
	var item = new Item();
	item.name = req.query.name;
	item.type = req.query.type;
	item.year = req.query.year;
	
	item.save(function(err, doc) {
		if (err) {
			res.redirect('/error');	//TODO zle, loop
			return;
		}
		
		res.redirect('/');	
	});
};
