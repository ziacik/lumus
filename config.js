var nconf = require('nconf');
var fs = require('fs');

nconf.argv().env().file({ file : "config.json"});

nconf.defaults({
	'version': 0,
	'xbmc-host': 'localhost',
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
	save : function(callback) {
		config.version = 1;
	
		nconf.set('version', config.version);
		nconf.set('xbmc-host', config.xbmcHost);
		
		nconf.set('search-url-movies', config.movieSearchUrl);
		nconf.set('search-url-shows', config.showSearchUrl);
		nconf.set('search-url-music', config.musicSearchUrl);
		
		nconf.set('target-dir-movies', config.movieTargetDir);
		nconf.set('target-dir-shows', config.showTargetDir);
		nconf.set('target-dir-music', config.musicTargetDir);
		
		nconf.set('size-limit-movies', config.movieSizeLimit);
		nconf.set('size-limit-shows', config.showSizeLimit);
		nconf.set('size-limit-music', config.musicSizeLimit);
		
		nconf.set('default-interval', config.defaultInterval);
		
		nconf.set('required-keywords-movies', config.movieRequiredKeywords);
		
		nconf.save(callback);
	}	
};

config.version = nconf.get('version');
config.xbmcHost = nconf.get('xbmc-host');

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