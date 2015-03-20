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
		digitalAudioPreference : Preference.preferred,
		hdVideoPreference : Preference.preferred
	},
	showSettings : {
		maxSize : 5200,
		destinationDir : 'Shows',
		digitalAudioPreference : Preference.preferred,
		hdVideoPreference : Preference.preferred
	},
	musicSettings : {
		maxSize : 300,
		destinationDir : 'Music',
		losslessFormatPreference : Preference.optional
	},
});

var legacyHdVideoPreference1 = nconf.get('movieSettings:requireHD');

if (legacyHdVideoPreference1) {
	nconf.set('movieSettings:hdVideoPreference', legacyHdVideoPreference1);
	nconf.clear('movieSettings:requireHD');
}

var legacyHdVideoPreference2 = nconf.get('showSettings:requireHD');

if (legacyHdVideoPreference2) {
	nconf.set('showSettings:hdVideoPreference', legacyHdVideoPreference2);
	nconf.clear('showSettings:requireHD');
}

var legacyDigitalAudioPreference1 = nconf.get('movieSettings:requireDigitalSound');

if (legacyDigitalAudioPreference1) {
	nconf.set('movieSettings:digitalAudioPreference', legacyDigitalAudioPreference1);
	nconf.clear('movieSettings:requireDigitalSound');
}

var legacyDigitalAudioPreference2 = nconf.get('showSettings:requireDigitalSound');

if (legacyDigitalAudioPreference2) {
	nconf.set('showSettings:digitalAudioPreference', legacyDigitalAudioPreference2);
	nconf.clear('showSettings:requireDigitalSound');
}

var legacyLosslessFormatPreference = nconf.get('musicSettings:requireLossless');

if (legacyLosslessFormatPreference) {
	nconf.set('musicSettings:losslessFormatPreference', legacyLosslessFormatPreference);
	nconf.clear('musicSettings:requireLossless');
}

if (legacyHdVideoPreference1 || legacyHdVideoPreference2 || legacyDigitalAudioPreference1 || legacyDigitalAudioPreference2 || legacyLosslessFormatPreference) {
	nconf.save();
}

labels.add({
	checkInterval : 'Check Interval [sec]',
	movieSettings : '<span class="fa fa-film" /> Movies',
	maxSize : 'Max Size [MB]',
	digitalAudioPreference : 'Digital Audio',
	hdVideoPreference : 'HD Video',
	showSettings : '<span class="fa fa-leaf" /> Shows',
	musicSettings : '<span class="fa fa-music" /> Music',
	losslessFormatPreference : 'Lossless Format',
	removeFinishedDays : 'Remove Finished Items After ? Days <small><em>0 is never</em></small>',
	destinationDir : 'Directory'
});

var nconfSave = Q.nbind(nconf.save, nconf);

module.exports.save = function() {
	nconf.set('version', 2);
	return nconfSave();
}