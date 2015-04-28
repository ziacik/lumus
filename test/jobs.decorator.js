var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var extend = require('util')._extend;

var Q = require('q');

var config = require('../config');
var decorator = require('../jobs/decorator')
var subtitler = require('../jobs/subtitler');

chai.use(chaiAsPromised);
chai.should();

subtitler.hasSubtitlesForName = function() {
	return Q(true);
}

var staticConfig = config.get();

config.get = function() {
	return staticConfig;
}

describe('decorator', function() {
	before(function() {
		config.get().movieSettings.digitalAudioPreference = config.Preference.required;
		config.get().movieSettings.hdVideoPreference = config.Preference.preferred;
		config.get().showSettings.digitalAudioPreference = config.Preference.optional;
		config.get().showSettings.hdVideoPreference = config.Preference.preferred;
	}),
	it('should correctly decorate hd ac3 movie', function() {
		var item = { type : 'movie' };
		
		var results = [{
			title : 'Something.720p',
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		var expected = extend({
			type : 'movie',
			hasHdVideo : true,
			hasDigitalAudio : true,
      		hasSubtitles : true,
			score : 8
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});

	it('should correctly decorate fake hd movie', function() {
		var item = { type : 'movie' };
		
		var results = [{
			title : 'Something.720p',
			verified : false,
			getDescription : function() {
				return 'Test 720 x 400 something';
			}
		}];
		
		var expected = extend({
			type : 'movie',
			hasHdVideo : false,
			hasDigitalAudio : false,
      		hasSubtitles : true,
			score : 1
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});

	it('should correctly decorate fake hd movie 2', function() {
		var item = { type : 'movie' };
		
		var results = [{
			title : 'Something.720p',
			verified : false,
			getDescription : function() {
				return 'Test width 720px ' +
					   'Height 300px something';
			}
		}];
		
		var expected = extend({
			type : 'movie',
			hasHdVideo : false,
			hasDigitalAudio : false,
      		hasSubtitles : true,
			score : 1
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});
	
	it('should correctly decorate hd dts show', function() {
		var item = { type : 'show' };
		
		var results = [{
			title : 'Something.720p',
			verified : true,
			getDescription : function() {
				return 'Test DTS something';
			}
		}];
		
		var expected = extend({
			type : 'show',
			hasHdVideo : true,
			hasDigitalAudio : true,
      		hasSubtitles : true,
			score : 5
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});

	it('should correctly decorate fake hd show', function() {
		var item = { type : 'show' };
		
		var results = [{
			title : 'Something.1080p',
			verified : false,
			getDescription : function() {
				return 'Test 720 x 600 something';
			}
		}];
		
		var expected = extend({
			type : 'show',
			hasHdVideo : false,
			hasDigitalAudio : false,
      		hasSubtitles : true,
			score : 1
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});

	it('should correctly decorate fake hd show 2', function() {
		var item = { type : 'show' };
		
		var results = [{
			title : 'Something.1080p',
			verified : false,
			getDescription : function() {
				return 'Test width 720 ' +
					   'Height 300px something';
			}
		}];
		
		var expected = extend({
			type : 'show',
			hasHdVideo : false,
			hasDigitalAudio : false,
      		hasSubtitles : true,
			score : 1
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});
	
	it('should correctly decorate mp3', function() {
		var item = { type : 'music' };
		
		var results = [{
			title : 'Something',
			verified : true,
			getDescription : function() {
				return 'Test FLAC something';
			}
		}];
		
		var expected = extend({
			type : 'music',
			isLosslessFormat : false,
			score : 0
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});
		
	it('should correctly decorate mp3 when preferred', function() {
		var item = { type : 'music' };
		config.get().musicSettings.losslessFormatPreference = config.Preference.disfavoured;
		
		var results = [{
			title : 'Something',
			verified : true,
			getDescription : function() {
				return 'Test FLAC something';
			}
		}];
		
		var expected = extend({
			type : 'music',
			isLosslessFormat : false,
			score : 1
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});
	
	it('should correctly decorate flac when preferred', function() {
		var item = { type : 'music' };
		config.get().musicSettings.losslessFormatPreference = config.Preference.preferred;
		
		var results = [{
			title : 'Something.FLAC',
			verified : true,
			getDescription : function() {
				return 'Test FLAC something';
			}
		}];
		
		var expected = extend({
			type : 'music',
			isLosslessFormat : true,
			score : 1
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});
	
	it('should correctly decorate flac when unwanted', function() {
		var item = { type : 'music' };
		config.get().musicSettings.losslessFormatPreference = config.Preference.unwanted;
		
		var results = [{
			title : 'Something.FLAC',
			verified : true,
			getDescription : function() {
				return 'Test FLAC something';
			}
		}];
		
		var expected = extend({
			type : 'music',
			isLosslessFormat : true,
			score : 0
		}, results[0]);
		
		return decorator.all(item, results).should.become([expected]);
	});
});