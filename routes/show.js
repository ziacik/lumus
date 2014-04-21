var Show = require('../models/show').Show;

exports.add = function(req, res) {
	Show.findOne({ showId : req.query.showId }, function(err, show) {
		if (!show) {	
			show = new Show();
			show.name = req.query.name;
			show.showId = req.query.nameId;
			
			show.save(function(err) {
				if (err) {
					res.redirect('/error');	//TODO zle, loop
					return;
				}
				
				res.redirect('/show?id=' + show._id + '&showId=' + show.showId + '&name=' + show.name);	
			});
		} else {
			res.redirect('/show?id=' + show._id + '&showId=' + show.showId + '&name=' + show.name);	
		}
	});	
};

exports.show = function(req, res) {
	Show.findById(req.query.id, function(err, item) {
		if (err) {
			res.render('error', {
				error: err
			});
		} else {
			res.render('show', {
				item: item
			});		
		}
	});
};