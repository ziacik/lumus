(function() {
	'use strict';

	angular
		.module('app.search')
		.service('SearchService', [ 'TheMovieDbService', SearchService ]);
	
	function SearchService(theMovieDbService) {
		var self = this;
			
		this.search = function(searchTerm) {
			return theMovieDbService.search(searchTerm);
		};
	}
})();