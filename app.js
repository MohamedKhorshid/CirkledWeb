var express = require('express');
var app = express();

var router = express.Router();
var bodyParser = require('body-parser');

var server = require('./config/server');
var auth = require('./lib/auth');
var mongo = require('./lib/db');

var WebSocketServer = require('websocket').server;

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
require('./routes/location')(router);

// start server
var server = app.listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + server.address().address + ':' + server.address().port);
});

var wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

var connections = [];

wsServer.on('request', function(request) {
	console.log('socket requested');
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log('Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
	connections.push(connection);
    connection.on('message', function(message) {
		console.log('message: ' + JSON.stringify(message));
        for(var i in connections) {
			var conn = connections[i];
			if (message.type === 'utf8') {
				conn.sendUTF(message.utf8Data);
			} else if (message.type === 'binary') {
				connection.sendBytes(message.binaryData);
			}
		}
    });
    connection.on('close', function(reasonCode, description) {
		var index = connections.indexOf(connection);
		if (index > -1) {
			connections.splice(index, 1);
			console.log('socket removed');
		}
		console.log('socket disconnected');
    });
});