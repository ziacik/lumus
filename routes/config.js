var config = require('../config');

exports.form = function(req, res) {
	res.render('config', {
		config: config
	});		
};

exports.save = function(req, res) {
	config.xbmcHost = req.body.xbmcHost;

	config.movieSearchUrl = req.body.movieSearchUrl;
	config.showSearchUrl = req.body.showSearchUrl;
	config.musicSearchUrl = req.body.musicSearchUrl;
	
	config.movieTargetDir = req.body.movieTargetDir;
	config.showTargetDir = req.body.showTargetDir;
	config.musicTargetDir = req.body.musicTargetDir;
	
	config.movieSizeLimit = req.body.movieSizeLimit;
	config.showSizeLimit = req.body.showSizeLimit;
	config.musicSizeLimit = req.body.musicSizeLimit;
	
	config.defaultInterval = req.body.defaultInterval;
	
	config.movieRequiredKeywords = req.body.movieRequiredKeywords;
	
	config.save(function(err) {
		if (err)
			res.redirect('/error'); //TODO
		else
			res.redirect('/config?success');
	});
};