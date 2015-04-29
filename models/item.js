var Q = require('q');

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

Item.setupAggregateMethods = function(items) {
	items.hasWaiting = function() {
		return items.some(function(item) {
			return item.isWaiting();
		});
	};

	items.hasDownloading = function() {
		return items.some(function(item) {
			return item.isDownloading();
		});
	};
	
	items.hasWaitingForSubtitles = function() {
		return items.some(function(item) {
			return item.isWaitingForSubtitles();
		});
	};
	
	items.hasFinished = function() {
		return items.some(function(item) {
			return item.isFinished();
		});
	};

	items.hasFailed = function() {
		return items.some(function(item) {
			return item.isFailed();
		});
	};	
}

Item.setupMethods = function(item) {
	item.getDisplayName = function() {
		if (item.type === ItemTypes.show)
			return item.name + " Season " + item.no;
		
		return item.name;
	};
	
	item.remove = function() {
		var deferred = Q.defer();
		
		db.items.remove({_id : item._id}, {}, function(err) {
			if (err) {
				util.error(err.stack || err);
				deferred.reject(err);
			} else {
				deferred.resolve();
			}
		});
		
		return deferred.promise;
	}

	item.save = function() {
		return Item.save(item);
	};
	
	item.planNextCheck = function(seconds) {
		item.nextCheck = new Date(new Date().getTime() + seconds * 1000).toJSON();		
	};
	
	item.rescheduleNextDay = function() {
		item.planNextCheck(60 * 60 * 24);
		return item.save();
	};
	
	item.rescheduleNextHour = function() {
		item.planNextCheck(60 * 60);
		return item.save();
	};
	
	item.isWaiting = function() {
		return item.state === ItemStates.wanted;
	};
	
	item.isDownloading = function() {
		return item.state === ItemStates.snatched;
	};
	
	item.isWaitingForSubtitles = function() {
		return item.state === ItemStates.renamed || item.state === ItemStates.libraryUpdated || item.state === ItemStates.subtitlerFailed || item.state === ItemStates.subtitled;
	};
	
	item.isFinished = function() {
		return item.state === ItemStates.finished;
	};
	
	item.isFailed = function() {
		return item.state === ItemStates.renameFailed;
	};
};

Item.save = function(item) {
	var deferred = Q.defer();
	
	if (item._id) {
		db.items.update({_id : item._id}, item, {}, function(err) {
			if (err) {
				util.error(err.stack || err);
				deferred.reject(err);
			} else {
				deferred.resolve(item);
			}
		});
	} else {
		db.items.insert(item, function(err, newDoc) {
			item._id = newDoc._id;
			if (err) {
				util.error(err.stack || err);
				deferred.reject(err);
			} else {
				deferred.resolve(item);
			}
		});
	}
	
	return deferred.promise;
};

Item.getAll = function() {
	return Item.find({}, { createdAt: -1 });
};

Item.findOne = function(what) {
	var deferred = Q.defer();
	
	db.items.findOne(what, function(err, item) {
		if (err) {
			util.error(err.stack || err);
			deferred.reject(err);
			return;
		}
		
		if (item) {
			Item.setupMethods(item);
		}
		
		deferred.resolve(item);
	});
	
	return deferred.promise;
};

Item.find = function(byWhat, sortBy) {
	var deferred = Q.defer();
	
	var query = db.items.find(byWhat);
	
	if (sortBy) {
		query = query.sort(sortBy);
	} 

	query.exec(function(err, items) {
		if (err) {
			util.error(err.stack || err);
			deferred.reject(err);
			return;
		}
		
		Item.setupAggregateMethods(items);
		
		items.forEach(function(item) {
			Item.setupMethods(item);
		});

		deferred.resolve(items);
	});
	
	return deferred.promise;
};

Item.findById = function(id) {
	return Item.findOne({_id : id});
};

Item.removeById = function(id) {
	var deferred = Q.defer();
	db.items.remove({_id : id}, function(err) {
		if (err) {
			deferred.reject(err);
			return;
		}
		deferred.resolve();
	});
	return deferred.promise;
};

module.exports.Item = Item;
module.exports.ItemTypes = ItemTypes;
module.exports.ItemStates = ItemStates;
module.exports.ItemTypeIcons = ItemTypeIcons;
