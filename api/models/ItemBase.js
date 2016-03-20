var Q = require('q');

module.exports = {
	schema : true,
	tableName : 'item',
	attributes : {
		state : {
			type : 'string',
			required : true,
			enum : [
				'Wanted',
				'Searching',
				'Downloading',
				'Renaming',
				'UpdatingLibrary',
				'Subtitling',
				'Finished'
			],
			defaultsTo : 'Wanted'
		},
		error : {
			type : 'string'
		},
		searchTerm : {
			type : 'string'
		},
		searchResults : {
			type : 'array'
		},
		torrentHash : {
			type : 'string'
		},
		torrentLinks : {
			type : 'array'
		},
		info : {
			type : 'string'
		},
		nextCheck : {
			type : 'dateTime',
			defaultsTo : function() {
				return new Date();
			}
		},

		setState : function(newState) {
			if (this.state !== newState) {
				this.state = newState;
				delete this.info;
			}
			return this;
		},

		setInfo : function(info) {
			this.info = info;
			return this;
		},

		setError : function(error) {
			this.error = error;
			return this;
		},

		saveAndPublish : function() {
			var self = this;
			return this.save().then(function() {
				console.log('SAVED');
				ItemBase.publishUpdate(self.id, { state : self.state, info : self.info, id : self.id });
			});
		},

		rescheduleNextHour : function() {
			var now = new Date();
			this.nextCheck = now.setTime(now.getTime() + 3600000);
			return this.save();
		},

		rescheduleNextDay : function() {
			var now = new Date();
			this.nextCheck = now.setDate(now.getDate() + 1);
			return this.save();
		},

		getSettingsKey: function() {
			return this.type.toLowerCase() + 'Settings';
		}
	}
};
