var _ = require('lodash');
var itemBaseModel = require('./ItemBase');
var musicBaseModel = require('./MusicBase');

module.exports = _.merge({
	attributes: {
		type : {
			enum : ['Album'],
			required : true,
			defaultsTo : 'Album'
		},
		artist : {
			model : 'Artist',
			required : true
		},		
		year : {
			type : 'integer',
			requried : true
		}
	}
}, itemBaseModel, musicBaseModel);