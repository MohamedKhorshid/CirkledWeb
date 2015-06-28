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
app.use('/', router);

// load routes
require('./routes/users')(router);
require('./routes/cirkle')(router);
require('./routes/search')(router);

// start server
var server = app.listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + server.address().address + ':' + server.address().port);
});
