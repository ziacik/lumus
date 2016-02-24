(function() {
	'use strict';

	angular
		.module('app.search')
		.controller('SearchController', [ '$location', '$scope', '$sails', '$timeout', 'SearchService', SearchController ]);
	
	function SearchController($location, $scope, $sails, $timeout, searchService) {
		var self = this;
		
		this.isSearching = false;
		
		this.movieResults = [];
		this.showResults = [];
		this.musicResults = [];
		
		this.status = {};
			
		this.noResults = function() {
			return !self.isSearching && !self.movieResults.length && !self.showResults.length && !self.musicResults.length; 
		};
		
		this.searching = function() {
			return self.isSearching;
		};
		
		this.isAdding = function(result) {
			return self.status[result.id] === 'adding';
		};
		
		this.isAdded = function(result) {
			return self.status[result.id] === 'added';
		};
		
		this.isError = function(result) {
			return self.status[result.id] === 'error';
		};
		
		this.addMovie = function(result) {
			self.status[result.id] = 'adding';
			
			$sails.post('/api/item/', {
				name : result.title,
				externalId : result.id,
				type : 'movie',
				posterUrl : result.poster_path
			}).then(function() {
				self.status[result.id] = 'added';
			}).catch(function(err) {
				self.status[result.id] = 'error';
				console.log(err);
				$timeout(function() {
					self.resetState(result);
				}, 3000);
			}); 
		};
		
		this.showSeasons = function(result) {
			$location.path('/seasons').search('id', result.id);
		};
				
		this.showAlbum = function(result) {
			$location.path('/albums').search('id', result.id);
		};

		this.resetState = function(result) {
			delete self.status[result.id];
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