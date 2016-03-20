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
			var now = new Date();
			this.nextCheck = now.setTime(now.getTime() + 3600000);
			return this.saveAndPublish();
		},

		rescheduleNextDay: function() {
			var now = new Date();
			this.nextCheck = now.setDate(now.getDate() + 1);
			return this.saveAndPublish();
		},

		getSettingsKey: function() {
			return this.type.toLowerCase() + 'Settings';
		}
	}
};
