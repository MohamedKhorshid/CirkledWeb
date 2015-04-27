var express = require('express');
var app = express();

var router = express.Router();
var bodyParser = require('body-parser');

var server = require('./config/server');
var auth = require('./lib/auth');
var db = require('./lib/db');

var serverPort = server.port || 8000;

// load routes
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

// authentication middleware
app.use(auth);
app.use('/', router);

// load routes
require('./routes/users')(router);
require('./routes/cirkle')(router);
require('./routes/search')(router);

// start server
app.listen(serverPort, function() {
  console.log('app started on port ' + serverPort);
	db.createConnection();
});
