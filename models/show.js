var Datastore = require('nedb');

if (typeof db == 'undefined') 
	db = {};

db.show = new Datastore("show.db");
db.show.loadDatabase();

db.show.persistence.setAutocompactionInterval(3600000); /// Compact every hour.

function Show() {
	this.name = null;
	this.seasons = [];
	
	Show.setupMethods(this);
}

Show.setupMethods = function(show) {
	show.save = function(done) {
		if (!done)
			throw "Sorry, done callback is required."; //TODO don't require callback
		
		if (show._id) {
			db.show.update({_id : show._id}, show, {}, done);
		} else {
			db.show.insert(show, function(err, newDoc) {
				show._id = newDoc._id;
				done(err);
			});
		}		
	};
	
	show.planNextCheck = function(seconds) {
		show.nextCheck = new Date(new Date().getTime() + seconds * 1000).toJSON();		
	};
};

Show.getAll = function(done) {
	db.show.find({}, function(err, show) {
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		for (index in show) {
			var show = show[index];
			Show.setupMethods(show);
		}

		done(null, show);
	});
};

Show.findOne = function(what, done) {
	db.show.findOne(what, function(err, show) {
		if (show)
			Show.setupMethods(show);
		
		done(err, show);
	});
};

Show.find = function(byWhat, done) {
	db.show.find(byWhat, function(err, show) {
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		for (index in show) {
			var show = show[index];
			Show.setupMethods(show);
		}

		done(null, show);
	});
};

Show.findById = function(id, done) {
	Show.findOne({_id : id}, done);
};

Show.removeById = function(id, done) {
	db.show.remove({_id : id}, done);
};

module.exports.Show = Show;