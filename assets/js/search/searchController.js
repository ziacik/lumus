(function() {
	'use strict';

	angular
		.module('app.search')
		.controller('SearchController', [ '$location', '$scope', 'SearchService', SearchController ]);
	
	function SearchController($location, $scope, searchService) {
		var self = this;
		this.results = [];
			
		this.search = function(searchTerm) {
			$location.path('/search').search('q', searchTerm);
		};
		
		var doSearch = function(searchTerm) {
			searchService.search(searchTerm).then(function(searchResults) {
				self.results = searchResults;
				console.log(self.results);
			}).catch(function(err) {
				console.log(err);
			});		
		};
		
		var searchTerm = $location.search().q;
		
		if (searchTerm) {
			doSearch(searchTerm);
		}		
	}
})();