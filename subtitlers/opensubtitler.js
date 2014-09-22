var config = require('../config');

var path = require('path');
var fs = require('fs');

var request = require('request');
var zlib = require('zlib');

var OpenSubtitles = require('opensubtitles');
var Item = require('../models/item').Item;
var ItemStates = require('../models/item').ItemStates;

function findSubtitles(item, done) {
	var os = new OpenSubtitles();
		
	console.log(item._id);
	console.log(item.name);
	console.log(item.torrentHash);
	console.log(item.renamedDir);
	
	fs.readdir(item.renamedDir, function(err, files) {
		if (err) {
			done(err);
			return;
		}
		
		findSubtitlesOne(os, item, done, files, 0);
	});
}

function findSubtitlesOne(os, item, done, files, index, passedError) {
	if (index >= files.length) {
		console.log('Done, passed error (if any): ' + passedError);
		done(passedError);
		return;
	}
	
	var file = files[index];
	var extPattern = /[.](avi|mkv|mp4|mpeg4|mpg4|mpg|mpeg|divx|xvid)$/i;
	
	if (!extPattern.test(file)) {
		console.log("Extension not matched, skipping " + file);
		findSubtitlesOne(os, item, done, files, index + 1, passedError);
		return;
	}
	
	var filePath = path.join(item.renamedDir, file);
	console.log("Looking up " + filePath);
		
	os.computeHash(filePath, function(err, hash){
		if (err) {
			console.log(err);
			findSubtitlesOne(os, item, done, files, index + 1, err);
			return;
		}

		os.api.LogIn(function(err, res){
		    if (err) {
				console.log(err);
				findSubtitlesOne(os, item, done, files, index + 1, err);
				return;
			}

    		var token = res.token;    		    		
    		var size = fs.statSync(filePath).size;
    		
    		os.api.SearchSubtitles(function(err, res) {
    			if (err) {
					console.log(err);
					findSubtitlesOne(os, item, done, files, index + 1, err);
					return;
				}
				
				var downloadLink;
				
				if (res.data)
				 	downloadLink = res.data[0].SubDownloadLink;
				
				if (downloadLink) {				
					var out = fs.createWriteStream(filePath + '.srt');
					var r = request(downloadLink); 
			    	r.on('end', function() {
			    		console.log('Downloaded subtitles for ' + file);
						findSubtitlesOne(os, item, done, files, index + 1, passedError);
			    	});
			    	r.on('error', function(error) {
			    		console.log(error);
						findSubtitlesOne(os, item, done, files, index + 1, error);
			    	});
			    	
			    	var gunzip = zlib.createGunzip();
			    	gunzip.on('error', function(e) {
			    		console.log('Unzip error: ' + e);
			    		findSubtitlesOne(os, item, done, files, index + 1, e);
			    	});  
			    	
			    	r.pipe(gunzip).pipe(out);
			    } else {
			    	findSubtitlesOne(os, item, done, files, index + 1, passedError || "No subtitles found.");
			    }		    		
    		}, token, [{
    			sublanguageid: config.subtitleLanguages,
    			moviehash: hash,
    			moviebytesize: size
    		}]);
    		
		}, "", "", "en", "OS Test User Agent"); //TODO
	});	
}

module.exports.findSubtitles = findSubtitles;