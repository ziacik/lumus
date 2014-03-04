var request = require('request');
var cheerio = require('cheerio');
var transmissionSessionId;
var torrentAddTries = 5;

exports.list = function(req, res) {
	res.render('list', {
		title : 'List'
	});
};

function fetchBestMovieResult($rootElements) {
	if ($rootElements.length == 0)
		return;
	
	doNext($rootElements, 0);
}

function doNext($rootElements, index) {
	var $rootElement = $rootElements[index];

	request('http://thepiratebay.se' + $($rootElement).children('.detLink').attr('href'), function(error, response, body) {
		if (error) {
			console.log(error);
			return;
		}
				
		if (body.indexOf('DTS') >= 0 || body.indexOf('AC3') >= 0 || body.indexOf('AC-3') >= 0) {
			addTorrent($($rootElement).next().attr('href'));
		} else {	
			if (index < $rootElements.length) {
				doNext($rootElements, index + 1);
			}
		}
	});
}

function addTorrent(magnetLink) {	
	var rpc = {};
	rpc.arguments = {};
	rpc.method = 'torrent-add';
	rpc.arguments.filename = magnetLink;
	
	var options = {
		url : 'http://malina:9091/transmission/rpc',
		method : 'POST',
		json : rpc,
		headers : {
			'X-Transmission-Session-Id' : transmissionSessionId
		}
	};

	request(options, function(error, response, body) {
		if (error) {
			console.log(error);
			tryAgainOrFail(function() { addTorrent(magnetLink); }, "Too many tries, getting error, giving up.");
			return;
		}
		
		if (response.statusCode == 409) {
			transmissionSessionId = response.headers['x-transmission-session-id'];
			tryAgainOrFail(function() { addTorrent(magnetLink); }, "Too many tries, getting 409, giving up.");
			return;
		}			
		
		console.log(body);
	});
}

function tryAgainOrFail(doWhat, message) {
	torrentAddTries--;
	
	if (torrentAddTries >= 0) {
		doWhat();
	} else {
		console.log(message);
		return;
	}
}

exports.add = function(req, res) {
	for (var key in req.body) {
		console.log(key);
		var url = "http://thepiratebay.se/search/" + key + "/0/7/207";

		request(url, function(err, resp, body) {
			if (err)
				throw err;
	
			$ = cheerio.load(body);					
			fetchBestMovieResult($(".detName"));
		});
	}

	res.redirect('/');
};