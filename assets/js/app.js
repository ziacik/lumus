(function() {
	'use strict';
	
	angular.module('app', [
		'ngSails'
	])/*.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.
		when('/user', {
			templateUrl: 'Content/NgUser.html',
			controller: 'UserController'
		}).
		when('/user/:userId', {
			//userId - variable from URL
			templateUrl: 'Content/NgUserDetail.html',
			controller: 'MessageController'
		}).
		when('/message/:messageId', {
			templateUrl: 'Content/NgMessageDetails.html',
			controller: 'MessageDetailController'
		}).
		otherwise({
			redirectTo: '/user'
		});
	}])*/;
})();