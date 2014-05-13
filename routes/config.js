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
	
	config.movieSizeLimit = parseInt(req.body.movieSizeLimit);
	config.showSizeLimit = parseInt(req.body.showSizeLimit);
	config.musicSizeLimit = parseInt(req.body.musicSizeLimit);
	
	config.defaultInterval = parseInt(req.body.defaultInterval);
	
	config.movieRequiredKeywords = req.body.movieRequiredKeywords.split(',');
	
	var isFirstSave = config.version === 0;
	
	config.save(function(err) {
		if (err)
			res.redirect('/error'); //TODO
		else if (isFirstSave)
			res.redirect('/');
		else
			res.redirect('/config?success');
	});
};