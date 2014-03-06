var ItemTypes = Object.freeze({film:"film", serie:"serie", music:"music"});
var ItemStates = Object.freeze({wanted:"wanted", snatched:"snatched", downloaded:"downloaded"});

var Datastore = require('nedb');

db = {};
db.items = new Datastore("items.db");

db.items.loadDatabase();

function Item() {
	this.name = null;
	this.type = null;
	this.state = ItemStates.wanted;
	
	Item.setupMethods(this);
}

Item.setupMethods = function(item) {
	item.save = function(done) {
		console.log('s');
		if (item._id) {
			db.items.update({_id : item._id}, item, {}, done);
		} else {
			console.log('i');
			db.items.insert(item, function(err, newDoc) {
				console.log(err);
				item._id = newDoc._id;
				done(err);
			});
		}
	};
};

Item.getAll = function(done) {
	console.log('0');
	db.items.find({}, function(err, items) {
		console.log('1');
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		console.log('2');
		for (item in items) {
			Item.setupMethods(item);
		}
		console.log('3');
		done(null, items);
	});
};

Item.findOne = function(what, done) {
	db.items.findOne(what, function(err, item) {
		if (item)
			Item.setupMethods(item);
		
		done(err, item);
	});
};

Item.findById = function(id, done) {
	Item.findOne({_id : id}, done);
};


module.exports.Item = Item;
module.exports.ItemTypes = ItemTypes;
module.exports.ItemStates = ItemStates;