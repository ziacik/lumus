var config = require('../config');
var labels = require('../labels');
var checker = require('../jobs/checker');

exports.form = function(req, res) {
	res.render('config', {
		config : config.get(),
		labels : labels
	});
};

var recursiveUpdate = function(req, configObject, propertyPrefix) {
	if (propertyPrefix === undefined) {
		propertyPrefix = '';
	}

	for (var propertyName in configObject) {
		if (configObject.hasOwnProperty(propertyName)) {
			var type = typeof configObject[propertyName];
			var fullPropertyName = propertyPrefix + propertyName;
			var postedValue = req.body[fullPropertyName];
			
			if (type === 'boolean') {
				config.set(fullPropertyName, postedValue === 'on');
			} else if (type === 'number') {
				if (postedValue) {
					config.set(fullPropertyName, parseInt(postedValue));
				} else {
					config.clear(fullPropertyName);
				}
			} else if (type === 'object') {
				recursiveUpdate(req, configObject[propertyName], fullPropertyName + ':');
			} else {
				config.set(fullPropertyName, postedValue);
			}
		}
	}
}

exports.save = function(req, res) {
	recursiveUpdate(req, config.get());

	var isFirstSave = config.get().version === 0;

	config.save().then(function() {
		checker.configure();
		
		if (isFirstSave) {
			res.redirect('/');
		} else {
			res.redirect('/config?success');
		}
	}).catch(function(error) {
		res.render('error', {
			error: error
		});
	});
};