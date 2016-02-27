(function() {
	'use strict';

	angular
		.module('app.search')
		.controller('SeasonSearchController', [ '$location', '$scope', '$sails', '$timeout', 'SearchService', SeasonSearchController ]);
	
	function SeasonSearchController($location, $scope, $sails, $timeout, searchService) {
		var self = this;
		
		this.isSearching = false;
		
		this.show = {};
		this.results = [];
		
		this.status = {};
			
		this.noResults = function() {
			return !self.isSearching && !self.results.length; 
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
		
		this.add = function(result) {
			self.status[result.id] = 'adding';
			
			$sails.post('/api/show/', {
				name : self.show.name,
				externalId : result.id,
				no : result.season_number,
				type : 'show',
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
		
		this.resetState = function(result) {
			delete self.status[result.id];
		};
		
		var doSearch = function(showId) {
			self.isSearching = true;
			searchService.getShow(showId).then(function(show) {
				self.show = show;
				self.results = show.seasons || [];
				self.isSearching = false;
			}).catch(function(err) {
				console.log(err);
				self.isSearching = false;
			});		
		};
		
		var id = $location.search().id;
		
		if (id) {
			doSearch(id);
		}		
	}
})();