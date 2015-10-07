var database = require('../../config/database');
var mongo = require('mongodb');
var monk = require('monk');
var connString = database.url;

var db = monk(connString);

module.exports = function(req, res, next) {
	req.db = db;
	next();
}