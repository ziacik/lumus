/**
 * ItemController
 *
 * @description :: Server-side logic for managing Items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*index : function(req, res) {
		Item.find().then(function(items) {
			res.view('main', {
				items : items,
				hasWaiting : function() {
					return items.some(function(item) {
						return item.isWaiting();
					});
				},
			
				hasDownloading : function() {
					return items.some(function(item) {
						return item.isDownloading();
					});
				},
				
				hasWaitingForSubtitles : function() {
					return items.some(function(item) {
						return item.isWaitingForSubtitles();
					});
				},
				
				hasFinished : function() {
					return items.some(function(item) {
						return item.isFinished();
					});
				},
			
				hasFailed : function() {
					return items.some(function(item) {
						return item.isFailed();
					});
				}			
			});
		}).fail(function(e) {
			res.negotiate(e);
		}).done();
	}*/	
};

