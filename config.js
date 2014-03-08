var nconf = require('nconf');

nconf.argv().env().file({ file : "config.json"});

var config = {};

config.movieTargetDir = nconf.get('target-dir-movies');
config.showTargetDir = nconf.get('target-dir-shows');
config.musicTargetDir = nconf.get('target-dir-music');

module.exports = config;