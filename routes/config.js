var config = require('../config');

exports.form = function(req, res) {
	res.render('config', {
		config: config
	});		
};