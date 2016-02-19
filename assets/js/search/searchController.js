(function() {
	'use strict';

	angular
		.module('app')
		.controller('SearchController', [ '$location', '$sails', SearchController]);
	
	function SearchController($location, $sails) {
		var self = this;
	
		this.search = function(searchTerm) {
			$location.path('/search').search('q', searchTerm);
		};
	}
})();