var database = require('../../config/database');
var pg = require('pg');
var connString = database.url;

module.exports.client = new pg.Client(connString);

module.exports.createConnection = function () {
	module.exports.client.connect(function() {
		console.log('Connected to database: ' + connString);
	});
}
