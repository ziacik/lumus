
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var search = require('./routes/search');
var music = require('./routes/music');
var show = require('./routes/show');
var list = require('./routes/list');
var item = require('./routes/item');
var torrent = require('./routes/torrent');
var config = require('./routes/config');
var http = require('http');
var path = require('path');
var checker = require('./jobs/checker');

var app = express();
app.locals.moment = require('moment');

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/update', routes.update);
app.get('/search', search.runSearch);
app.get('/add', list.add);
app.get('/list', list.list);
app.get('/changeState', item.changeState);
app.get('/remove', item.remove);
app.get('/artist', music.artist);
app.get('/artist/add', music.add);
app.get('/show', show.show);
app.get('/show/add', show.add);
app.get('/torrent', torrent.list);
app.get('/torrent/add', torrent.add);
app.get('/config', config.form);
app.get('/newReleases', function(req, res) {
  res.render('newReleases');
});
app.post('/config', config.save);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Lumus server listening on port ' + app.get('port'));
});

process.nextTick(checker);
