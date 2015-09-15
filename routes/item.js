var util = require('util');
var Q = require('q');
var notifier = require('../jobs/notifier');
var torrenter = require('../jobs/torrenter');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

exports.changeState = function(req, res) {
	return Item.findById(req.query.id).then(function(item) {
		item.stateInfo = undefined;
		item.state = req.query.state; //TODO vulnerability (validate)
		
		if (item.state !== ItemStates.finished) {
			item.planNextCheck(1); /// To cancel possible postpone.
		}
		
		if (item.state === ItemStates.finished) {
			delete item.searchResults;
		}
		
		return item.save()
		.then(function() {
			res.redirect('/');
		});
	})
	.catch(function(error) {
		util.error(error.stack || error);
		res.render('error', { error : error });
	});
};


exports.remove = function(req, res) {
	return Item.findById(req.query.id).then(function(item) {
		if (item) {
			return Item.removeById(req.query.id).then(function() {
				return torrenter.removeTorrent(item, true).then(function() {
					return Q(undefined);
				}).catch(function(error) {
					util.error(error.stack || error);
				});
			});
		}
	}).then(function() {
		res.redirect('/');
	}).catch(function(error) {
		util.error(error.stack || error);
		res.render('error', { error : error });
	});
}

exports.add = function(req, res) {
	var item = new Item();
	item.name = req.query.name;
	item.type = req.query.type;
	item.year = req.query.year;
	item.no = req.query.no;
	item.externalId = req.query.externalId;
	
	return item
	.save()
	.then(function() {
		res.redirect('/');	
	})
	.catch(function(error) {
		util.error(error.stack || error);
		res.render('error', { error: error });
	});
};
