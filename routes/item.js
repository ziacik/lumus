var notifier = require('../jobs/notifier');

var Item = require('../models/item').Item;
var ItemTypes = require('../models/item').ItemTypes;
var ItemStates = require('../models/item').ItemStates;
var ItemTypeIcons = require('../models/item').ItemTypeIcons;

exports.changeState = function(req, res) {
	Item.findById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else {
			item.state = req.query.state; //TODO vulnerability (validate)
			
			if (item.state === ItemStates.finished) {
				notifier.updateLibrary(item);
			} else {
				item.planNextCheck(1); /// To cancel possible postpone.
			}
			
			console.log('saving item ' + item.name + ' to sched ' + item.nextCheck);
			
			item.save(function(err) {
				if (err) {
					console.log(err);
					res.redirect('/error', { error: err });
				}
			}); //TODO log
			res.redirect('/');
		}
	});
};


exports.remove = function(req, res) {
	Item.removeById(req.query.id, function(err, item) {
		if (err) {
			res.redirect('/error', { error: err });
		} else {
			res.redirect('/');
		}
	});
}

exports.add = function(req, res) {
	var item = new Item();
	item.name = req.query.name;
	item.type = req.query.type;
	item.year = req.query.year;
	item.no = req.query.no;
	
	item.save(function(err, doc) {
		if (err) {
			res.redirect('/error');	//TODO zle, loop
			return;
		}
		
		res.redirect('/');	
	});
};
