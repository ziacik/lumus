function getParameter(name) {
	return decodeURIComponent(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

function showError(e, errorDivId, what) {
	var message = e.statusText + ' (' + e.status + ')';
	
	if (e.status === 404)
		message = what + ' info not found.';

	$(errorDivId).text(message);
	$(errorDivId).show();
	
	console.log('Error getting info.');
	console.log(e);
}

function showInfo(showId) {
	$.getJSON("http://api.trakt.tv/show/summary.json/18607462d7b7bfd44d68a4721c732900/" + showId + "?callback=?", function(info) {
		$("#poster").attr("src", info.images.poster.replace('.jpg', '-300.jpg'));
		$("#basicInfo").text(info.year + ", " + info.runtime + "min" + ", " + info.status);
		$("#overview").text(info.overview);	
	}).fail(function(e) {
		showError(e, '#error', 'Show');
	});	
}

function findSeasons(showId, showName) {
	$.getJSON("http://api.trakt.tv/show/seasons.json/18607462d7b7bfd44d68a4721c732900/" + showId + "?callback=?", function(seasonInfos) {
		listSeasons(showId, showName, seasonInfos);		
	}).fail(function(e) {
		showError(e, '#error2', 'Season');
	});	
}

function sort(results) {
	results.sort(function (result1, result2) {
		return (result1.season < result2.season) ? -1 : 1;
	});
}

function listSeasons(showId, showName, results) {
	sort(results);

	$.each(results, function(key, val) {
		$(getSeasonItem(showId, showName, val)).appendTo("#seasons");
	});
}

function getSeasonItem(showId, showName, seasonInfo) {
	var item = 
		"<p><img height='40px' src='" + seasonInfo.poster + "' /><span class='fa fa-show'></span> Season " +
		seasonInfo.season + " (" + seasonInfo.episodes + " episodes)" +
		" <a class='btn btn-default btn-xs' href='/add?type=show&name=" + encodeURIComponent(showName) + "&no=" + seasonInfo.season + "'</a>" +
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
