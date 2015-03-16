var templates = [];
var noResultCount = 0;

function getParameter(name) {
	return decodeURIComponent(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

function showError(which, err) {
	stopSpinner(which);
	$('#' + which + 'ErrorText').text(' Failed ' + which + ' search: ' + err);
	$('#' + which + 'Error').show();
}

function stopSpinner(which) {
	$('#' + which + 'Spinner').hide();
}

function noResult(which) {
	if (which) {
		$('#' + which).hide();
		noResultCount++;
	}
	
	if (noResultCount === 3) {
		$('#noResult').show();
	}
}

function findShowsAndMovies(what) {
	$.getJSON("http://www.omdbapi.com/?i=&s=" + what, function(data) {
		stopSpinner('movie');
		stopSpinner('show');
		sortByYear(data.Search);
		listMovies(data.Search);
		listShows(data.Search);
	}).fail(function(jqxhr, textStatus, error) {
		showError('movie', textStatus + (error ? ', ' + error : ''));
		showError('show', textStatus + (error ? ', ' + error : ''));
	});
}

function findMusic(what) {
	$.getJSON("http://musicbrainz.org/ws/2/artist?query=%22" + what + "%22&fmt=json", function(data) {
		stopSpinner('music');
		listArtists(data.artists);
	}).fail(function(jqxhr, textStatus, error) {
		showError('music', textStatus + (error ? ', ' + error : ''));
	});
}

function sortByYear(results) {
	if (results) {
		results.sort(function (result1, result2) {
			return (result1.Year < result2.Year) ? 1 : -1;
		});
	}
}

function listMovies(results) {
	var hadResult = false;

	if (results) {	
		var movieResults = $.grep(results, function(result) {
			return result.Type === "movie";
		});
		
		$.each(movieResults, function(key, val) {
			hadResult = true;
			$(getItem("movie", val)).appendTo("#movies");
		});
	}
	
	if (!hadResult) {
		noResult('movies');
	}
}

function listShows(results) {
	var hadResult = false;
		
	if (results) {
		var showResults = $.grep(results, function(result) {
			return result.Type === "series";
		});
		
		$.each(showResults, function(key, val) {
			hadResult = true;
			$(getItem("show", val)).appendTo("#shows");
		});
	}
	
	if (!hadResult) {
		noResult('shows');
	}
}

function listArtists(results) {
	var hadResult = false;

	if (results) {
		$.each(results, function(key, val) {
			hadResult = true;
			$(getItem("music", val)).appendTo("#music");
		});
	}
	
	if (!hadResult) {
		noResult('music');
	}
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
