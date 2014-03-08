
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var search = require('./routes/search');
var list = require('./routes/list');
var http = require('http');
var path = require('path');
var checker = require('./jobs/checker');

var app = express();

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
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/search', search.runSearch);
app.post('/add', list.add);
app.get('/list', list.list);

// start cron
var CronJob = require('cron').CronJob;
new CronJob('* * * * * *', function(){
    checker();
}, null, true);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
