module.exports = function(req, res, next) {

	if(req.url.indexOf('/api/v1/')  < 0) {
		next();
		return;
	}

	if(req.url.indexOf('/api/v1/public')  >= 0) {
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
	
	var userscollection = req.db.get('users');
	
	var email = token[1];
	var password = token[2];

	userscollection.find({'email' : email, 'password' : password},{},function(e,docs){
	
		if(e) {
			console.log('error while authenticating');
			console.log(e);
			res.status(500).end();
		} else if(docs.length > 0) {
			req.user = docs[0];
			next();
		} else {
			res.status(401).end();
		}
		
	});
	
}
