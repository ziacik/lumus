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
	console.log(item.mainFile);
	
	var filePath = path.join(item.renamedDir, item.mainFile);
	
	os.computeHash(filePath, function(err, hash){
		if (err) {
			done(err);
			return;
		}
		
		os.api.LogIn(function(err, res){
		    if (err) {
		    	done(err);
		    	return;
		    }

    		console.log(res);
    		
    		var token = res.token;
    		
    		console.log(hash);
    		
    		var size = fs.statSync(filePath).size;
    		console.log(size);
    		
    		os.api.SearchSubtitles(function(err, res) {
    	    	console.log(res); //TODO remove
    
    			if (err) {
    				console.log(err);
			    	done(err);
			    	return;
			    }
				
				var downloadLink = res.data[0].SubDownloadLink;
				
				console.log(downloadLink);
				
				if (downloadLink) {				
					var out = fs.createWriteStream(filePath + '.srt');
					var r = request(downloadLink); 
			    	r.on('end', function() {
			    		console.log('Done');
			    		done();
			    	});
			    	r.on('error', function(error) {
			    		console.log(error);
			    		done(err);
			    	});
			    	console.log('Piping');
			    	r.pipe(zlib.createGunzip()).pipe(out);
			    }		    		
    		}, token, [{
    			sublanguageid: 'slo,cze',
    			moviehash: hash,
    			moviebytesize: size
    		}]);
    		
		}, "", "", "en", "OS Test User Agent");
	});	
}

module.exports.findSubtitles = findSubtitles;