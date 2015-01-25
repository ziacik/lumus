var templates = [];

function getParameter(name) {
	return decodeURIComponent(
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
		listArtists(data.artists);
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
		$(getItem("movie", val)).appendTo("#results");
	});
}

function listShows(results) {
	var showResults = $.grep(results, function(result) {
		return result.Type === "series";
	});
	
	$.each(showResults, function(key, val) {
		$(getItem("show", val)).appendTo("#results");
	});
}

function listArtists(results) {
	$.each(results, function(key, val) {
		$(getItem("music", val)).appendTo("#results");
	});
}

function getItem(type, info) {
	return templates[type](info);
}

$(document).ready(function(){
	templates['movie'] = Handlebars.compile($("#movie-template").html());
	templates['show'] = Handlebars.compile($("#show-template").html());
	templates['music'] = Handlebars.compile($("#music-template").html());
	
	var what = getParameter("what");	
	findShowsAndMovies(what);
	findMusic(what);
});
