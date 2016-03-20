var _ = require('lodash');
var itemBaseModel = require('./ItemBase');
var movieShowBaseModel = require('./MovieShowBase');

module.exports = _.merge({
	attributes: {
		type: {
			enum: ['Season'],
			required: true,
			defaultsTo: 'Season'
		},
		show: {
			model: 'Show',
			required: true
		},
		year: {
			type: 'integer',
			required: true
		},
		no: {
			type: 'integer',
			required: true
		},
		getSettingsKey: function() {
			return 'showSettings';
		}
	}
}, itemBaseModel, movieShowBaseModel);
