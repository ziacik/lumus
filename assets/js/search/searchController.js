(function() {
	'use strict';

	angular
		.module('app.search')
		.controller('SearchController', [ '$location', '$scope', '$sails', '$timeout', 'SearchService', 'TheMovieDbService', SearchController ]);
	
	function SearchController($location, $scope, $sails, $timeout, searchService, theMovieDbService) {
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
			
			theMovieDbService.getMovie(result.id).then(function(movie) {
				return $sails.post('/api/movie/', {
					name : result.title,
					tmdbId : result.id,
					imdbId : movie.imdb_id,
					year : 1900 + new Date(movie.release_date).getYear(),
					posterUrl : result.poster_path
				});
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
			$location.path('/search/seasons').search('id', result.id);
		};
				
		this.showAlbum = function(result) {
			$location.path('/search/albums').search('id', result.id);
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