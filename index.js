var express = require('express');
var app = express();
var database = require('./config/database');
var server = require('./config/server');
var pg = require('pg');

// validate configuration 
if(!database.url) {
  console.error('Invalid database url');
  return;
}

// set env parameters
var connString = database.url;
var serverPort = server.port || 8000;

// open connection to db
var client = new pg.Client(connString);
client.connect(function() {
  console.log('Connected to database: ' + connString);
});

// load routes
require('./routes/users')(app, express, client);

// start server
app.listen(serverPort, function() {
  console.log('app started on port ' + serverPort);
});
