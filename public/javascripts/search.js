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
	var yearQuery = (type === "movie") ? "&year=" + year : "";
	var yearInfo = year ? " (" + year + ")" : "";

	var item = 
		"<p><span class='fa fa-" + icon + "'></span> " +
		name + yearInfo +
		" <a class='btn btn-default btn-xs' href='/add?type=" + type + "&name=" + encodeName(name) + yearQuery + "'</a>" +
			"<span class='glyphicon glyphicon-plus'></span>" +			
		"</a></p>";
	return item;
}

$(document).ready(function(){
	var what = getParameter("what");
	findShowsAndMovies(what);
	findMusic(what);
});
