var Q = require('q');
var npm = require('npm');
var fs = require('fs');
var path = require('path');
var moment = require('moment');

var newVersionLastChecked;
var lastNewVersion;

//TODO Review
module.exports.update = function() {
	var load = Q.nbind(npm.load, npm);
    return load().then(function() {
    	console.log('update');
		var update = Q.nbind(npm.commands.update, npm.commands);
        return update([]);
    }).then(function(data) {
    	console.log('Update result', data);
    });
}

module.exports.newVersion = function() {	
	var today = moment().format('YYYY-MM-DD');

	if (newVersionLastChecked === today) {
		return Q(lastNewVersion);
	}
	
	var load = Q.nbind(npm.load, npm);
    return load().then(function() {
		var view = Q.nbind(npm.commands.view, npm.commands);
        return view(["lumus", "version"]);
    }).then(function(data) {
    	var version;
    	
		for (var i = 0; i < data.length; i++) {
			var record = data[i];
			
			if (!record) {
				continue;
			}
			
	    	for (var property in record) {
	    		if (record.hasOwnProperty(property) && record[property].version) {
	    			version = record[property].version;
	    			break;
	    		}
	    	}
    	}

   		newVersionLastChecked = today;
    	
    	if (version !== module.exports.myVersion) {
    		lastNewVersion = version;
    		return version;
    	} else {
    		lastNewVersion = undefined;
			return Q(undefined);
		}
    });
}

var getMyVersion = function() {
    var packageJson = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8');
	var packageInfo = JSON.parse(packageJson);
    return packageInfo.version;
}

module.exports.myVersion = getMyVersion();