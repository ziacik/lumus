module.exports = {
	schema : true,
	attributes: {
		name : {
			type : 'string',
			required : true
		},
		posterUrl : {
			type : 'string'
		},
		brainzId : {
			type : 'string',
			required : true,
			unique : true
		}
	}
};