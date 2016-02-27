var _ = require('lodash');
var movieShowBaseModel = require('./MovieShowBase');

module.exports = _.merge({
	attributes: {
		name : {
			type : 'string',
			required : true
		}
	}
}, movieShowBaseModel);