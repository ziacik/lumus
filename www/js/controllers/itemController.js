(function() {
	'use strict';

	angular
		.module('app')
		.controller('ItemController', [ '$sails', ItemController]);
	
	function ItemController($sails) {
		var self = this;
	
		(function () {
			$sails.get('/api/item').then(function (resp) {
				self.items = resp.data;
			}).catch(function (err) {
				alert(err);
			});

			var itemsHandler = $sails.on('item', function (message) {
				if (message.verb === 'created') {
					self.items.push(message.data);
				}
			});
	
			// Stop watching for updates
			$scope.$on('$destroy', function() {
				$sails.off('item', itemsHandler);
			});

		}());
	}
})();