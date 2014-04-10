var Music = require('../models/music').Music;

exports.add = function(req, res) {
	Music.findOne({ artistId : req.query.artistId }, function(err, music) {
		if (!music) {	
			music = new Music();
			music.artist = req.query.name;
			music.artistId = req.query.artistId;
			
			music.save(function(err) {
				if (err) {
					res.redirect('/error');	//TODO zle, loop
					return;
				}
				
				res.redirect('/artist?id=' + music._id + '&artistId=' + music.artistId + '&name=' + music.artist);	
			});
		} else {
			res.redirect('/artist?id=' + music._id + '&artistId=' + music.artistId + '&name=' + music.artist);	
		}
	});	
};

exports.artist = function(req, res) {
	Music.findById(req.query.id, function(err, item) {
		if (err) {
			res.render('error', {
				error: err
			});
		} else {
			res.render('artist', {
				item: item
			});		
		}
	});
};