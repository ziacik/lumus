var Q = require('q');
var Show = require('../models/show').Show;
var TvdbClient = require("node-tvdb");
var tvdb = new TvdbClient("6E61D6699D0B1CB0");

exports.add = function(req, res) {
	Show.findOne({ showId : req.query.showId })
	.then(function(show) {
		if (!show) {	
			show = new Show();
			show.name = req.query.name;
			show.showId = req.query.showId;			
			return show.save();
		} else {
			return Q(show);
		}
	}).then(function(show) {
		res.redirect('/show?id=' + show._id + '&showId=' + show.showId + '&name=' + encodeURIComponent(show.name));		
	})
	.catch(function(error) {
		res.render('error', {
			error: error
		});		
	});
};

exports.show = function(req, res) {
	var i;
	
	Show.findById(req.query.id)
	.then(function(item) {		
		i = item;
		return getShowInfo(item);
	})
	.then(function(info) {
		reduceShowInfo(info);
		res.render('show', {
			item: i,
			info: info
		});		
	})
	.catch(function(error) {
		res.render('error', {
			error: error
		});		
	});
};

var getShowInfo = function(item) {
	console.log('Looking for item ' + item.showId + ' in tvdb.')	
	return tvdb.getSeriesByRemoteId(item.showId).then(function (info) {
		if (!info) {
			throw 'Could not find season info about this show.'; 
		}
		return tvdb.getSeriesAllById(info.seriesid);
	});
}

var reduceShowInfo = function(fullInfo) {
	if (fullInfo[0] && fullInfo[0].SeriesName) {
		fullInfo = fullInfo[0];
	}
	
	if (!Array.isArray(fullInfo.Episodes)) {
		fullInfo.Episodes = [ fullInfo.Episodes ];
	}
	
	var seasonInfo = fullInfo.Episodes.reduce(function(info, episode, index, array) {
		if (episode.SeasonNumber !== '0') {
			var seasonItem = findByNo(info, episode.SeasonNumber);
			var episodeYear = getYear(episode.FirstAired);
			
			if (!seasonItem) {
				seasonItem = {
					No : episode.SeasonNumber,
					Year : episodeYear
				};
				
				info.push(seasonItem);
			} else {
				if (seasonItem.Year > episodeYear) {
					seasonItem.Year = episodeYear;
				}
			}
		}
		
		return info;
	}, []);

	fullInfo.seasons = seasonInfo;	
	delete fullInfo.Episodes;
}

var findByNo = function(data, no) {
	for (var i = 0; i < data.length; i++) {	
		if (data[i].No == no) {
			return data[i];
		}
	}
	
	return null;
}

var getYear = function(date) {
	if (!date) {
		return 'unknown';
	} else {
		return date.substr(0, date.indexOf('-'));
	}
}