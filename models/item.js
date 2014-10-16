var ItemTypes = Object.freeze({
	movie:"movie", 
	show:"show", 
	music:"music"
});

var ItemTypeIcons = Object.freeze({
	movie:"film", 
	show:"leaf", 
	music:"music"
});

var ItemStates = Object.freeze({
	wanted:"wanted", 
	snatched:"snatched", 
	downloaded:"downloaded", 
	renamed:"renamed",
	renameFailed:"renameFailed",
	libraryUpdated:"libraryUpdated", 
	subtitled:"subtitled", 
	subtitlerFailed:"subtitlerFailed",
	finished:"finished"
});

var Datastore = require('nedb');

if (typeof db == 'undefined') 
	db = {};
	
db.items = new Datastore("items.db");
db.items.loadDatabase();

db.items.persistence.setAutocompactionInterval(3600000); /// Compact every hour.

function Item() {
	this.name = null;
	this.type = null;
	this.no = null;
	this.year = null;
	this.externalId = null;
	this.state = ItemStates.wanted;
	this.createdAt = new Date().toJSON();
	this.torrentLinks = [];
	this.searchTerm = null; 
	
	Item.setupMethods(this);
}

Item.setupMethods = function(item) {
	item.getDisplayName = function() {			
		if (item.type === ItemTypes.show)
			return item.name + " Season " + item.no;
		
		return item.name;		
	};
	
	item.remove = function(done) {
		if (!done)
			throw "Sorry, done callback is required.";
		
		db.items.remove({_id : item._id}, {}, done);
	}

	item.save = function(done) {
		if (!done)
			throw "Sorry, done callback is required.";
		
		if (item._id) {
			db.items.update({_id : item._id}, item, {}, done);
		} else {
			db.items.insert(item, function(err, newDoc) {
				item._id = newDoc._id;
				done(err);
			});
		}
	};
	
	item.planNextCheck = function(seconds) {
		item.nextCheck = new Date(new Date().getTime() + seconds * 1000).toJSON();		
	}
};

Item.getAll = function(done) {
	db.items.find({}).sort({ createdAt: -1 }).exec(function(err, items) {
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		for (index in items) {
			var item = items[index];
			Item.setupMethods(item);
		}

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

Item.find = function(byWhat, done) {
	db.items.find(byWhat, function(err, items) {
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		for (index in items) {
			var item = items[index];
			Item.setupMethods(item);
		}

		done(null, items);
	});
};

Item.findById = function(id, done) {
	Item.findOne({_id : id}, done);
};

Item.removeById = function(id, done) {
	db.items.remove({_id : id}, done);
};

module.exports.Item = Item;
module.exports.ItemTypes = ItemTypes;
module.exports.ItemStates = ItemStates;
module.exports.ItemTypeIcons = ItemTypeIcons;