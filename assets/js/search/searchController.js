(function() {
	'use strict';

	angular
		.module('app.search')
		.controller('SearchController', [ '$location', '$scope', 'SearchService', SearchController ]);
	
	function SearchController($location, $scope, searchService) {
		var self = this;
		
		this.isSearching = false;
		
		this.movieResults = [];
		this.showResults = [];
		this.musicResults = [];
			
		this.search = function(searchTerm) {
			$location.path('/search').search('q', searchTerm);
		};
		
		this.noResults = function() {
			return !self.isSearching && !self.movieResults.length && !self.showResults.length && !self.musicResults.length; 
		};
		
		this.searching = function() {
			return this.isSearching;
		};
		
		var doSearch = function(searchTerm) {
			self.isSearching = true;
			searchService.search(searchTerm).then(function(results) {
				self.movieResults = results.movieResults || [];
				self.showResults = results.showResults || [];
				self.musicResults = results.musicResults || [];
				self.isSearching = false;
			}).catch(function(err) {
				console.log(err);
				self.isSearching = false;
			});		
		};
		
		var searchTerm = $location.search().q;
		
		if (searchTerm) {
			doSearch(searchTerm);
		}		
	}
})();