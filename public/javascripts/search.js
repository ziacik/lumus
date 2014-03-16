function getParameter(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

function findShowsAndMovies(what) {
	$.getJSON("http://www.omdbapi.com/?i=&s=" + what, function(data) {
		sortByYear(data.Search);
		listMovies(data.Search);
		listShows(data.Search);
	});	
}

function findMusic(what) {
	$.getJSON("http://musicbrainz.org/ws/2/artist?query=%22" + what + "%22&fmt=json", function(data) {
		listArtists(data.artist);
	});	
}

function sortByYear(results) {
	results.sort(function (result1, result2) {
		return (result1.Year < result2.Year) ? 1 : -1;
	});
}

function listMovies(results) {
	var movieResults = $.grep(results, function(result) {
		return result.Type === "movie";
	});
	
	$.each(movieResults, function(key, val) {
		$(getItem("movie", "film", val.Title, val.Year)).appendTo("#results");
	});
}

function listShows(results) {
	var showResults = $.grep(results, function(result) {
		return result.Type === "series";
	});
	
	$.each(showResults, function(key, val) {
		$(getItem("show", "leaf", val.Title, val.Year)).appendTo("#results");
	});
}

function listArtists(results) {
	$.each(results, function(key, val) {
		var name = val.name + (val.disambiguation ? " (" + val.disambiguation + ")" : "");
		$(getItem("music", "music", name)).appendTo("#results");
	});
}

function encodeName(value){
	return value.replace('\'', '&#39;');
}

function getItem(type, icon, name, year) {
	var item = "<div class='checkbox'><label><input type='checkbox' name='" + type + "-" + encodeName(name) + "' /> <span class='fa fa-" + icon + "'></span> " + name + (year ? " (" + year + ")" : "") + "</div>";
	return item;
}

$(document).ready(function(){
	var what = getParameter("what");
	findShowsAndMovies(what);
	findMusic(what);
});
