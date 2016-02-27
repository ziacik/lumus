module.exports = {
	schema : true,
	attributes: {
		posterUrl : {
			type : 'string'
		},
		tmdbId : {
			type : 'string',
			required : true,
			unique : true
		},
		imdbId : {
			type : 'string',
			required : true
		}
	}
};

