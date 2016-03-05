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
		torrentLinks : {
			type : 'array'
		},
		nextCheck : {
			type : 'dateTime'
		}
	}
};
