function getParameter(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

function showInfo(showId) {
	$.getJSON("http://api.trakt.tv/show/summary.json/18607462d7b7bfd44d68a4721c732900/" + showId + "?callback=?", function(info) {
		$("#banner").attr("src", info.images.banner);
		$("#basicInfo").text(info.year + ", " + info.runtime + "min" + ", " + info.status);
		$("#overview").text(info.overview);	
	}).fail(function() {
		console.log('Error getting season info.'); //TODO
	});	
}

function findSeasons(showId, showName) {
	$.getJSON("http://api.trakt.tv/show/seasons.json/18607462d7b7bfd44d68a4721c732900/" + showId + "?callback=?", function(seasonInfos) {
		listSeasons(showId, showName, seasonInfos);		
	}).fail(function() {
		console.log('Error getting season info.'); //TODO
	});	
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
		"<p><img height='40px' src='" + seasonInfo.poster + "' /><span class='fa fa-show'></span> Season " +
		seasonInfo.season + " (" + seasonInfo.episodes + " episodes)" +
		" <a class='btn btn-default btn-xs' href='/add?type=show&name=" + encodeName(showName) + "&no=" + seasonInfo.season + "'</a>" +
			"<span class='glyphicon glyphicon-plus'></span>" +			
		"</a></p>";
	return item;
}

$(document).ready(function(){
	var showId = getParameter("showId");
	var showName = getParameter("name");
	showInfo(showId);
	findSeasons(showId, showName);	
});
