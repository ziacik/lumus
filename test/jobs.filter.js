var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var extend = require('util')._extend;

var Q = require('q');

var config = require('../config');
var filter = require('../jobs/filter')
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

describe('filter', function() {
	before(function() {
		config.get().movieSettings.digitalAudioPreference = config.Preference.optional;
		config.get().movieSettings.hdVideoPreference = config.Preference.optional;
	}),
	
	it('should remove non-hd movie when required', function() {
		config.get().movieSettings.hdVideoPreference = config.Preference.required;
		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove non-hd movie when not required', function() {
		config.get().movieSettings.hdVideoPreference = config.Preference.preferred;
		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});
	
	it('should remove hd movie when unwanted', function() {
		config.get().movieSettings.hdVideoPreference = config.Preference.unwanted;
		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : true,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove hd movie when not unwanted', function() {
		config.get().movieSettings.hdVideoPreference = config.Preference.optional;
		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : true,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove non-dts movie when required', function() {
		config.get().movieSettings.digitalAudioPreference = config.Preference.required;

		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : false,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove non-dts movie when not required', function() {
		config.get().movieSettings.digitalAudioPreference = config.Preference.preferred;

		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove dts movie when unwanted', function() {
		config.get().movieSettings.digitalAudioPreference = config.Preference.unwanted;

		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove dts movie when not unwanted', function() {
		config.get().movieSettings.digitalAudioPreference = config.Preference.disfavoured;

		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove non-lossless music when required', function() {
		config.get().musicSettings.losslessFormatPreference = config.Preference.required;

		var item = { type : 'music' };
		
		var results = [{
			type : 'music',
			title : 'Something.NotHd',
			isLosslessFormat : false,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove non-lossless music when not required', function() {
		config.get().musicSettings.losslessFormatPreference = config.Preference.preferred;

		var item = { type : 'music' };
		
		var results = [{
			type : 'music',
			title : 'Something.NotHd',
			isLosslessFormat : false,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove lossless music when unwanted', function() {
		config.get().musicSettings.losslessFormatPreference = config.Preference.unwanted;

		var item = { type : 'music' };
		
		var results = [{
			type : 'music',
			title : 'Something.NotHd',
			isLosslessFormat : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove lossless music when not unwanted', function() {
		config.get().musicSettings.losslessFormatPreference = config.Preference.disfavoured;

		var item = { type : 'music' };
		
		var results = [{
			type : 'music',
			title : 'Something.NotHd',
			isLosslessFormat : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});
	
	
	it('should remove non-hd show when required', function() {
		config.get().showSettings.hdVideoPreference = config.Preference.required;
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove non-hd show when not required', function() {
		config.get().showSettings.hdVideoPreference = config.Preference.preferred;
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});
	
	it('should remove hd show when unwanted', function() {
		config.get().showSettings.hdVideoPreference = config.Preference.unwanted;
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : true,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove hd show when not unwanted', function() {
		config.get().showSettings.hdVideoPreference = config.Preference.optional;
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : true,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove non-dts show when required', function() {
		config.get().showSettings.digitalAudioPreference = config.Preference.required;

		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : false,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove non-dts show when not required', function() {
		config.get().showSettings.digitalAudioPreference = config.Preference.preferred;

		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove dts show when unwanted', function() {
		config.get().showSettings.digitalAudioPreference = config.Preference.unwanted;

		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should not remove dts show when not unwanted', function() {
		config.get().showSettings.digitalAudioPreference = config.Preference.disfavoured;

		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(results[0]);
	});

	it('should remove show from wrong season', function() {
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Seasons 1-2.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove movie exceeding size limit', function() {
		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			size : 10000,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove show exceeding size limit', function() {
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			hasHdVideo : false,
			hasDigitalAudio : true,
			size : 100000,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove music exceeding size limit', function() {
		var item = { type : 'music' };
		
		var results = [{
			type : 'music',
			title : 'Something Season 1.NotHd',
			size : 10000,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});
	
	it('should remove movie with 0 seeders', function() {
		var item = { type : 'movie' };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			seeds : 0,
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove show with 0 seeders', function() {
		var item = { type : 'show', no : 1 };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			seeds : 0,
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove music with 0 seeders', function() {
		var item = { type : 'music' };
		
		var results = [{
			type : 'music',
			title : 'Something Season 1.NotHd',
			seeds : 0,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});
	
	it('should remove movie that was already used', function() {
		var item = { type : 'movie', torrentLinks : ['abc'] };
		
		var results = [{
			type : 'movie',
			title : 'Something.NotHd',
			magnetLink : 'abc',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove show that was already used', function() {
		var item = { type : 'show', no : 1, torrentLinks : ['abc'] };
		
		var results = [{
			type : 'show',
			title : 'Something Season 1.NotHd',
			magnetLink : 'abc',
			hasHdVideo : false,
			hasDigitalAudio : true,
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	it('should remove music that was already used', function() {
		var item = { type : 'music', torrentLinks : ['abc'] };
		
		var results = [{
			type : 'music',
			title : 'Something Season 1.NotHd',
			magnetLink : 'abc',
			verified : true,
			getDescription : function() {
				return 'Test AC-3 something';
			}
		}];
		
		return filter.first(item, results).should.become(undefined);
	});

	
});