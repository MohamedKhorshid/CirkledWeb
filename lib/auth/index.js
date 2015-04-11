module.exports = function(req, res, next) {

	var db = require('../db');
		
	if(req.url.indexOf('/public')  == 0) {
		next();
		return;
	}

	var authorizationHeader = req.headers.authorization;

	if(!authorizationHeader) {
		res.status(401).end();
		return;
	}

	var parts = authorizationHeader.split(' ');

	if ('basic' != parts[0].toLowerCase()) {
		res.status(401).end();
		return;
	}

  if (!parts[1]) {
		res.status(401).end();
		return;
	}

  var token = parts[1];


  token = new Buffer(token, 'base64').toString();


  token = token.match(/^([^:]*):(.*)$/);

	if (!token) {
		res.status(401).end();
		return;
	}

	db.client.query('select * from user_ where email = $1 and password = $2', [token[1], token[2]], function(err, result) {
	
		if(err) {
			res.status(500).end();
		} else if(result.rowCount > 0) {
			next();
		} else {
			res.status(401).end();
		}

	});
	
}
