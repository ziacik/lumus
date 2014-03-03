var request = require('request');
var cheerio = require('cheerio');

exports.list = function(req, res) {
	res.render('list', {
		title : 'List'
	});
};

exports.add = function(req, res) {
	for (var key in req.body) {
		console.log(key);
		var url = "http://thepiratebay.se/search/" + key + "/0/7/207";

		request(
				url,
				function(err, resp, body) {
					if (err)
						throw err;

					$ = cheerio.load(body);

					var magnetLink = $(".detName").first().next().attr('href');
					var rpc = {};
					rpc.arguments = {};
					rpc.method = 'torrent-add';
					rpc.arguments.filename = magnetLink;
					
					console.log(rpc);

					var options = {
							url : 'http://malina:9091/transmission/rpc',
							method : 'POST',
							json : rpc,
							headers : {
								'X-Transmission-Session-Id' : 'sOk7mIovL4vkPAH8jvyNgJY63RH9oupTUqmSqrMubE5O8pkj'
							}
						};

					request(options, function(error, response, body) {
						console.log(error);
						console.log(body);
					});

				}
			);
	}

	res.redirect('/');
};