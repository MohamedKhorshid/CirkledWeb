module.exports = function(req, res, next) {

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
	
	var userscollection = req.db.get('users');
			
	userscollection.find({'email' : token[1], 'password' : token[2]},{},function(e,docs){
	
		if(docs.length > 0) {
			req.user = docs[0];
			next();
		} else {
			res.status(401).end();
		}
		
	});
	
}
