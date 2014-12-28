var nodeIsohunt = require('node-isohunt');

var searchFor = function(item, callback) {
	console.log('Searching for ' + item.name + ' with isohunt');
	var opts = {
		ihq : item.name,
		start : 1, // Optional. Starting row number in paging through results set.
					// First page have start=1, not 0. Defaults to 1.
		rows : 3, // Optional. Results to return, starting from parameter "start".
					// Defaults to 100. Upper limit of 100.
		sort : 'seeds', // Optional. Defaults to composite ranking (over all factors
						// such as age, query relevance, seed/leechers counts and
						// votes). Parameter takes only values of "seeds", "age" or
						// "size", where seeds sorting is combination of
						// seeds+leechers. Sort order defaults to descending.
		order : 'desc' // Optional, can be either "asc" or "desc". Defaults to
						// descending, in conjunction with sort parameter.
	};
	// obs: start+rows have maximum possible limit of 1000.

	nodeIsohunt(opts, function(data) {
		console.log('Done searching for ' + item.name + ' with isohunt');
		
		callback(data);
		/*var t = data.items.list.map(function(each) {
			return {
				title : each.title,
				link : each.link,
				torrentUrl : each.enclosure_url,
				size : each.size
			};
		});

		console.log(t);*/
		//TODO: ERR?
	}, function(err) {
		callback(undefined, err);
	});	
}

module.exports.searchFor = searchFor;