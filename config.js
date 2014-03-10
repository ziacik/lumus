var nconf = require('nconf');

nconf.argv().env().file({ file : "config.json"});

nconf.defaults({
	'torrent-search-url': 'http://thepiratebay.se/search/${query}/0/7/207',
	'default-interval': 60
});

var config = {};

config.movieTargetDir = nconf.get('target-dir-movies');
config.showTargetDir = nconf.get('target-dir-shows');
config.musicTargetDir = nconf.get('target-dir-music');
config.torrentSearchUrl = nconf.get('torrent-search-url');

config.defaultInterval = nconf.get('default-interval');

module.exports = config;