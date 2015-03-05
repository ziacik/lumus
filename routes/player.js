var package = require('../package.json');
var grooveSharkService = require('grooveshark-streaming');
var mediaPlayer = require('../notifiers/xbmc');
var Q = require('q');
var request = Q.denodeify(require('request'));
var getSongInfo = Q.nbind(grooveSharkService.Tinysong.getSongInfo, grooveSharkService.Tinysong);
var getStreamUrl = Q.nbind(grooveSharkService.Grooveshark.getStreamingUrl, grooveSharkService.Grooveshark);
var writeFile = Q.denodeify(require('fs').writeFile);


module.exports.play = function(req, res) {
	var artistName = req.query.artistName;
	var albumId = req.query.albumId;
	var albumName;
	var songNames;
	var streamFilePath = process.cwd() + '/music.strm';
	var streamUrls;

	callMusicBrainz('/release-group/' + albumId + '?inc=releases&fmt=json')
	.spread(function(res, body) {
		var data = JSON.parse(body);
		if (data.releases.length === 0) {
			res.render('error', { error: 'No release info found for the album.' });
			return;
		}
		
		albumName = data.title;
		var releaseId = data.releases[0].id; //TODO review. can i just choose the first one?		
		return callMusicBrainz('/release/' + releaseId + '?inc=recordings&fmt=json');
	})
	.spread(function(res, body) {
		var data = JSON.parse(body);
		if (data.media.length === 0) {
			res.render('error', { error: 'No media info found for the album.' });
			return;
		}
		
		//TODO review. can i just choose the first one?
		songNames = data.media[0].tracks.map(function(track) {
			return track.title;
		});
		
		var urlPromises = songNames.map(function(songName) {
			return Q.fcall(getGrooveSharkUrl, artistName, songName);
		});
		
		return Q.all(urlPromises);
	})
	.then(function(urls) {
		streamUrls = urls;
		return writeFile(streamFilePath, urls.join(require('os').EOL));
	})
	.then(function() {
		return mediaPlayer.play(streamFilePath);
	})
	.then(function(result) {
		var data = {};
		data.mediaPlayerSuccess = result;
		data.title = artistName + ' : ' + albumName;
		data.contents = songNames.map(function(songName, index) {
			return { title : songName, found : streamUrls[index] };
		});
		res.render('player', data);
	})
	.catch(function(error) {
		res.render('error', { error: error });
	});
}

var callMusicBrainz = function(urlPart) {	
	var options = {
	    url: 'http://musicbrainz.org/ws/2' + urlPart,
	    headers: {
	        'User-Agent': 'Lumus/' + package.version + ' (http://ziacik.github.io/lumus/)'
	    }
	};
	
	return request(options);
};

var getGrooveSharkUrl = function(artistName, songName) {
	return getSongInfo(songName, artistName)
	.then(function(songInfo) {
		if (!songInfo) {
			return;
		}
		return getStreamUrl(songInfo.SongID);		
	});
}; 