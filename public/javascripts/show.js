function getParameter(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

function findSeasons(showId, showName) {
	var seasonInfos = [{
		no : 1,
		year: 2000
	}, {
		no : 2,
		year: 2001
	}, {
		no : 3,
		year: 2002
	}, {
		no : 4,
		year: 2003
	}, {
		no : 5,
		year: 2004
	}, {
		no : 6,
		year: 2005
	}, {
		no : 7,
		year: 2006
	}, {
		no : 8,
		year: 2007
	}, {
		no : 9,
		year: 2008
	}]; //TODO hardcoded
	listSeasons(showId, showName, seasonInfos);
}

function sortByYear(results) {
	results.sort(function (result1, result2) {
		var year1 = result1["first-release-date"];
		year1 = year1.substr(0, year1.indexOf('-')) || year1;
		
		var year2 = result2["first-release-date"];
		year2 = year2.substr(0, year2.indexOf('-')) || year2;
		
		result1.Year = year1;
		result2.Year = year2;

		return (year1 < year2) ? 1 : -1;
	});
}

function listSeasons(showId, showName, results) {
	//sortByYear(results);

	$.each(results, function(key, val) {
		$(getSeasonItem(showId, showName, val)).appendTo("#seasons");
	});
}

function encodeName(value){
	return value.replace('\'', '&#39;');
}

function getSeasonItem(showId, showName, seasonInfo) {
	var item = 
		"<p><span class='fa fa-show'></span> Season " +
		seasonInfo.no + " (" + seasonInfo.year + ")" +
		" <a class='btn btn-default btn-xs' href='/add?type=show&name=" + encodeName(showName) + "&no=" + seasonInfo.no + "'</a>" +
			"<span class='glyphicon glyphicon-plus'></span>" +			
		"</a></p>";
	return item;
}

$(document).ready(function(){
	var showId = getParameter("showId");
	var showName = getParameter("name");
	findSeasons(showId, showName);	
});
