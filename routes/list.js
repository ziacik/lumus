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
	for (var key in req.body) {
		var item = new Item();
		item.name = key;
		item.type = ItemTypes.movie;
		item.save(function(err, doc) {
			if (err) {
				res.redirect('/error');	//TODO zle, loop
			} else {
				res.redirect('/');	//TODO zle, loop		
			}				
		});
		
		break; //TODO
	}	
};