var config = require('../config');
var Item = require('../models/item').Item;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;
var version = require('../helpers/version');

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
				version.newVersion().then(function(result) {
					res.render('index', {
						title : 'lumus',
						myVersion : version.myVersion,
						newVersion : result,
						items : items,
						icons : ItemTypeIcons
					});
				}).catch(function(error) {
					util.error(error);
					res.render('index', {
						title : 'lumus',
						myVersion : '?',
						newVersion : '?',
						items : items,
						icons : ItemTypeIcons
					});
				});
			}
		});
	}	
};

exports.update = function(req, res) {
	version.update().then(function() {
		res.redirect('/');
	}).catch(function(error) {
		util.error(error);
		res.render('error', {
			error: err
		});
	});
};