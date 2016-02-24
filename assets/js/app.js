(function() {
	'use strict';
	
	angular.module('app', [
		'ngRoute',
		'ngSails',
		'angular.filter',
		'app.search'
	]).config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/', {
			templateUrl : '/templates/main',
			controller : 'MainController',
			controllerAs : 'mainController'			
		}).when('/search', {
			templateUrl : '/templates/search',
			controller : 'SearchController',
			controllerAs : 'searchController'
		}).when('/search/seasons', {
			templateUrl : '/templates/search/seasons',
			controller : 'SeasonSearchController',
			controllerAs : 'seasonSearchController'
		}).when('/search/albums', {
			templateUrl : '/templates/search/albums',
			controller : 'AlbumSearchController',
			controllerAs : 'albumSearchController'
		}).otherwise({
			redirectTo : '/'
		});
	}]);
})();