(function() {
	'use strict';

	angular
		.module('app')
		.controller('MainController', [ '$location', '$scope', '$sails', MainController]);
	
	function MainController($location, $scope, $sails) {
		var self = this;
	
		(function () {
			$sails.get('/api/itembase').then(function (resp) {
				self.items = resp.data;
				self.modelUpdaterDestructor = $sails.$modelUpdater('itembase', self.items);
			}).catch(function (err) {
				alert(err);
			});

			$scope.$on('$destroy', function() {
				if (self.modelUpdaterDestructor) {
					self.modelUpdaterDestructor();
				}				
			});

		}());
		
		this.search = function() {
			$location.path('/search').search('q', this.searchTerm);
		};
		
		this.iconFor = function(item) {
			switch(item.type) {
			case 'movie':
				return 'film';
			case 'show':
				return 'tv';
			case 'music':
				return 'music';
			}
		};
		
		this.stateWeight = function(item) {
			if (item.state === 'wanted') {
				return 0;
			} else if (item.state === 'finished') {
				return 100;
			} else {
				return 50;
			}
		};
		
		this.changeState = function(item, newState) {
			$sails.put('/api/itembase/' + item.id, {
				state : newState
			}).then(function(resp) {
				angular.extend(item, resp.body);
			}).catch(function(err) {
				console.log(err);
				alert(err); //TODO
			});
		};
		
		this.remove = function(item) {
			$sails.delete('/api/itembase/' + item.id).then(function(resp) {
				self.items = self.items.filter(function(existingItem) {
					return existingItem.id !== item.id;
				});
			}).catch(function(err) {
				console.log(err);
				alert(err); //TODO
			});
		};
	}
})();