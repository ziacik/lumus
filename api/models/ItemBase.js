module.exports = {
	schema : true,
	tableName : 'item',
	//identity : 'item',
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
		torrentLinks : {
			type : 'array'
		},
		nextCheck : {
			type : 'dateTime',
			defaultsTo : function() {
				return new Date();
			}
		},
		
		setState : function(newState) {
			this.state = newState;
			return this.saveAndPublish();
		},
		
		saveAndPublish : function() {
			var self = this;
			return this.save().then(function() {
				console.log('SAVED');
				ItemBase.publishUpdate(self.id, { state : self.state, id : self.id });			
			});
		},
		
		rescheduleNextHour : function() {
			var now = new Date();
			this.nextCheck = now.setTime(now.getTime() + 3600000);
			return this.save();
		}
	}
};
