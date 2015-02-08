var util = require('util');
var notifier = require('../jobs/notifier');
var torrenter = require('../jobs/torrenter');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

exports.changeState = function(req, res) {
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else {
			item.stateInfo = undefined;
			item.state = req.query.state; //TODO vulnerability (validate)
			
			if (item.state !== ItemStates.finished) {
				item.planNextCheck(1); /// To cancel possible postpone.
			}
			
			console.log('saving item ' + item.name + ' to sched ' + item.nextCheck);
			
			item
			.save()
			.then(function() {
				res.redirect('/');
			})
			.catch(function(error) {
				res.render('error', { error: error });
			});
		}
	});
};


exports.remove = function(req, res) {
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
			console.log(err);
			return;
		}
		
		Item.removeById(req.query.id, function(err, removedId) {
			if (err) {
				res.redirect('/error', { error: err });
				console.log(err);
				return;
			}
			
			torrenter.removeTorrent(item, true);
			res.redirect('/');
		});
	});
}

exports.add = function(req, res) {
	var item = new Item();
	item.name = req.query.name;
	item.type = req.query.type;
	item.year = req.query.year;
	item.no = req.query.no;
	item.externalId = req.query.externalId;
	
	item
	.save()
	.then(function() {
		res.redirect('/');	
	})
	.catch(function(error) {
		util.error(error);
		res.render('error', { error: error });
	});
};
