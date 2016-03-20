var _ = require('lodash');
var itemBaseModel = require('./ItemBase');
var movieShowBaseModel = require('./MovieShowBase');

module.exports = _.merge({
	attributes: {
		type : {
			enum : ['Movie'],
			required : true,
			defaultsTo : 'Movie'
		},
		name : {
			type : 'string',
			required : true
		},
		year : {
			type : 'integer',
			required : true
		}		
	}
}, itemBaseModel, movieShowBaseModel);
