module.exports = {
	schema: true,
	tableName: 'item',
	attributes: {
		state: {
			type: 'string',
			required: true,
			enum: [
				'Wanted',
				'Searching',
				'Downloading',
				'Renaming',
				'UpdatingLibrary',
				'Subtitling',
				'Finished'
			],
			defaultsTo: 'Wanted'
		},
		error: {
			type: 'string'
		},
		searchTerm: {
			type: 'string'
		},
		searchResults: {
			type: 'array'
		},
		torrentHash: {
			type: 'string'
		},
		torrentLinks: {
			type: 'array'
		},
		downloadDir: {
			type: 'string'
		},
		mainFile: {
			type: 'string'
		},
		info: {
			type: 'string'
		},
		nextCheck: {
			type: 'dateTime',
			defaultsTo: function() {
				return new Date();
			}
		},

		setState: function(newState) {
			if (this.state !== newState) {
				this.state = newState;
				delete this.info;
				delete this.error;
			}
			return this;
		},

		setInfo: function(info) {
			this.info = info;
			return this;
		},

		setError: function(error) {
			this.error = error.message || error.toString();
			return this;
		},

		saveAndPublish: function() {
			var self = this;
			return this.save().then(function() {
				console.log('SAVED', self);
				ItemBase.publishUpdate(self.id, {
					state: self.state,
					error: self.error,
					info: self.info,
					id: self.id
				});
			});
		},

		rescheduleNextHour: function() {
			var nextHour = new Date();
			nextHour.setTime(nextHour.getTime() + 3600000)
			this.nextCheck = nextHour;
			return this.saveAndPublish();
		},

		rescheduleNextDay: function() {
			var nextDay = new Date();
			nextDay.setDate(nextDay.getDate() + 1);
			this.nextCheck = nextDay;
			return this.saveAndPublish();
		},

		getSettingsKey: function() {
			return this.type.toLowerCase() + 'Settings';
		}
	}
};
