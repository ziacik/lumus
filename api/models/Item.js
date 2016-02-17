/**
 * Item.js
 * 
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	attributes : {
		name : {
			type : 'string',
			required : true
		},
		type : {
			type : 'string',
			required : true,
			enum : [ 'movie', 'show', 'music' ]
		},
		no : {
			type : 'integer'
		},
		year : {
			type : 'integer'
		},
		externalId : {
			type : 'string'
		},
		state : {
			type : 'string',
			required : true,
			enum : [ "wanted", "snatched", "downloaded", "renamed", "renameFailed", "libraryUpdated", "libraryUpdateFailed", "subtitled", "subtitlerFailed",
					"finished" ],
			defaultsTo : 'wanted'
		},
		torrentLinks : {
			type : 'array'
		},
		searchTerm : {
			type : 'string'
		},
		searchResults : {
			type : 'array'
		}
	}
};
