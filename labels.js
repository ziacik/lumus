var labels = {};

module.exports.add = function(translationMap) {
	for (var property in translationMap) {
        if (translationMap.hasOwnProperty(property)) {
            labels[property] = translationMap[property];
        }
    }
}

module.exports.get = function() {
	for (var i = 0; i < arguments.length; i++) {
		var translation = labels[arguments[i]];
		if (translation) {
			return translation;
		}
	}
	return arguments[0];
}