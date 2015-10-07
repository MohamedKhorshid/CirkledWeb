var express = require('express');
var app = express();

var router = express.Router();
var bodyParser = require('body-parser');

var server = require('./config/server');
var auth = require('./lib/auth');
var mongo = require('./lib/db');

var http_host = (process.env.VCAP_APP_HOST || '0.0.0.0');
var http_port = (process.env.VCAP_APP_PORT || 8000);

app.set('port', http_port);
app.set('host',http_host);

// load routes
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

// inject DB
app.use(mongo);

// authentication middleware
app.use(auth);
app.use('/api/v1', router);

// load routes
require('./routes/users')(router);
require('./routes/cirkle')(router);
require('./routes/search')(router);
require('./routes/location')(router);

// start server
var server = app.listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + server.address().address + ':' + server.address().port);
});


app.get('/', function(req, res) {
  res.sendFile('./public/app/main.html', {"root": __dirname});
});

app.get('/app/*', function(req, res) {
  res.sendFile('./public/app/' + req.params[0], {"root": __dirname});
});

app.get('/css/*', function(req, res) {
  res.sendFile('./public/css/' + req.params[0], {"root": __dirname});
});

app.get('/js/*', function(req, res) {
  res.sendFile('./public/js/' + req.params[0], {"root": __dirname});
});

app.get('/img/*', function(req, res) {
  res.sendFile('./public/img/' + req.params[0], {"root": __dirname});
});