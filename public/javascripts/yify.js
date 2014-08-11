function findYify() {
	$.getJSON('https://yts.re/api/list.json?rating=6&sort=date&limit=50', function(data) { //TODO rating configure
		listMovies(data.MovieList);
	});	
}

function listMovies(results) {
	var usedTitles = [];

	var movieResults = $.grep(results, function(result) {
		if (usedTitles.indexOf(result.MovieTitleClean) >= 0)
			return false;
					
		if (result.MovieYear > 2010) { //TODO
			usedTitles.push(result.MovieTitleClean);
			return true;
		}
		
		return false;
	});
	
	$.each(movieResults, function(key, val) {
		$(getItem(val.MovieTitleClean, val.MovieYear, val.MovieRating, val.Genre, val.MovieUrl, val.CoverImage)).appendTo("#results");
	});
}

function getItem(name, year, rating, genre, infoUrl, imageUrl) {
	var ref = 'add';	
	var yearQuery = '&year=' + year;
	var yearInfo = year ? ' (' + year + ')' : '';
	var ratingInfo = rating ? ' (' + rating + ')' : '';
	var genreInfo = genre ? ' (' + genre + ')' : '';

	var item = 
		"<p><img src='" + imageUrl + "' /> " +
		"<a href='" + infoUrl + "' target='_blank'>" + name + yearInfo + ratingInfo + genreInfo + "</a>" +
		" <a class='btn btn-default btn-xs' href='/" + ref + "?type=movie&name=" + encodeURIComponent(name) + yearQuery + "'</a>" +
			"<span class='glyphicon glyphicon-plus'></span>" +			
		"</a></p>";
	return item;
}

$(document).ready(function(){
	findYify();
});
