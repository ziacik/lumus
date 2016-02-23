(function() {
	'use strict';

	angular
		.module('app.search')
		.service('TheMovieDbService', [ '$http', TheMovieDbService ]);
	
	function TheMovieDbService($http) {
		var self = this;
		
		var createRequest = function(type, searchTerm) {
			return $http({
				method: 'GET',
				url: 'https://api.themoviedb.org/3/search/' + type,
				params : {
					api_key : 'f647d297016fdbf28f67b9ebe0dbdd93',
					query : searchTerm
				}
			});		
		};
		
		var checkStatus = function(response) {
			if (response.status !== 200) {
				throw new Error('Error searching movie db. Status code is ' + response.status + '.');
			}
		};
			
		this.search = function(searchTerm) {
			return createRequest('movie', searchTerm).then(function(movieResponse) {
				checkStatus(movieResponse);
			
				return createRequest('tv', searchTerm).then(function(tvResponse) {
					checkStatus(tvResponse);
				
					return {
						movieResults : movieResponse.data.results, 
						showResults : tvResponse.data.results
					};
				}); 
			});	
		};
	}
})();