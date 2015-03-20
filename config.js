var nconf = require('nconf');
var fs = require('fs');
var labels = require('./labels');
var Q = require('q');

module.exports = nconf;
module.exports.Preference = Object.freeze({
	required : 'required',
	preferred : 'preferred',
	optional : 'optional',
	disfavoured : 'disfavoured',
	unwanted : 'unwanted',
});

var Preference = module.exports.Preference;

nconf.use('file', { file : "config.v2.json"});
nconf.load();

nconf.defaults({
	version: 0,	
	checkInterval : 60,
	removeFinishedDays : 0,
	movieSettings : {
		maxSize : 5200,
		destinationDir : 'Movies',
		requireDigitalSound : Preference.preferred,
		requireHD : Preference.preferred
	},
	showSettings : {
		maxSize : 5200,
		destinationDir : 'Shows',
		requireDigitalSound : Preference.preferred,
		requireHD : Preference.preferred
	},
	musicSettings : {
		maxSize : 300,
		destinationDir : 'Music',
		requireLossless : Preference.optional
	},
});

labels.add({
	checkInterval : 'Check Interval [sec]',
	movieSettings : '<span class="fa fa-film" /> Movies',
	maxSize : 'Max Size [MB]',
	requireDigitalSound : 'Digital Sound',
	requireHD : 'HD Video',
	showSettings : '<span class="fa fa-leaf" /> Shows',
	musicSettings : '<span class="fa fa-music" /> Music',
	requireLossless : 'Lossless Format',
	removeFinishedDays : 'Remove Finished Items After ? Days <small><em>0 is never</em></small>',
	destinationDir : 'Directory'
});

var nconfSave = Q.nbind(nconf.save, nconf);

module.exports.save = function() {
	nconf.set('version', 2);
	return nconfSave();
}