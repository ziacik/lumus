var nconf = require('nconf');

nconf.argv().env().file({ file : "config.json"});

nconf.defaults({
	'search-url-movies': 'https://thepiratebay.se/search/${query}/0/7/207',
	'search-url-shows': 'https://thepiratebay.se/search/${query}/0/7/205',
	'search-url-music': 'https://thepiratebay.se/search/${query}/0/7/100',
	'size-limit-movies': 5200,
	'size-limit-shows': 5200,
	'size-limit-music': 300,
	'default-interval': 60,
	'required-keywords-movies': ['DTS', 'AC3', 'AC-3']
});

var config = {
	get : function(key, fallback) {
		if (!config[key])
			config[key] = nconf.get(key);
		
		if (!config[key])
			config[key] = fallback;
			
		return config[key];			
	}
};

config.movieSearchUrl = nconf.get('search-url-movies');
config.showSearchUrl = nconf.get('search-url-shows');
config.musicSearchUrl = nconf.get('search-url-music');

config.movieTargetDir = nconf.get('target-dir-movies');
config.showTargetDir = nconf.get('target-dir-shows');
config.musicTargetDir = nconf.get('target-dir-music');

config.movieSizeLimit = nconf.get('size-limit-movies');
config.showSizeLimit = nconf.get('size-limit-shows');
config.musicSizeLimit = nconf.get('size-limit-music');

config.defaultInterval = nconf.get('default-interval');

config.movieRequiredKeywords = nconf.get('required-keywords-movies');

module.exports = config;