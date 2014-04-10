var Datastore = require('nedb');

if (typeof db == 'undefined') 
	db = {};

db.music = new Datastore("music.db");
db.music.loadDatabase();

db.music.persistence.setAutocompactionInterval(3600000); /// Compact every hour.

function Music() {
	this.artist = null;
	this.albums = [];
	
	Music.setupMethods(this);
}

Music.setupMethods = function(music) {
	music.save = function(done) {
		if (!done)
			throw "Sorry, done callback is required."; //TODO don't require callback
		
		if (music._id) {
			db.music.update({_id : music._id}, music, {}, done);
		} else {
			db.music.insert(music, function(err, newDoc) {
				music._id = newDoc._id;
				done(err);
			});
		}		
	};
	
	music.planNextCheck = function(seconds) {
		music.nextCheck = new Date(new Date().getTime() + seconds * 1000).toJSON();		
	};
};

Music.getAll = function(done) {
	db.music.find({}, function(err, music) {
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		for (index in music) {
			var music = music[index];
			Music.setupMethods(music);
		}

		done(null, music);
	});
};

Music.findOne = function(what, done) {
	db.music.findOne(what, function(err, music) {
		if (music)
			Music.setupMethods(music);
		
		done(err, music);
	});
};

Music.find = function(byWhat, done) {
	db.music.find(byWhat, function(err, music) {
		if (err) {
			console.log(err);
			done(err, null);
		}
		
		for (index in music) {
			var music = music[index];
			Music.setupMethods(music);
		}

		done(null, music);
	});
};

Music.findById = function(id, done) {
	Music.findOne({_id : id}, done);
};

Music.removeById = function(id, done) {
	db.music.remove({_id : id}, done);
};

module.exports.Music = Music;