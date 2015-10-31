module.exports = function (router) {
	var validator = require('../lib/node-validator');
	var cirkleValidator = require('../lib/cirkle-validator');
	var async = require('async');
	var passwordHash = require('password-hash');
	
	router.route('/public/login').post(function(req, res) {
		
		var email = req.body.email;
		var password = req.body.password;
		
		var userscollection = req.db.get('users');
			
		async.waterfall([
			function(callback) {
			userscollection.find({'email' : email},{},function(e,docs){
				if(e) {
					console.log(e);
					callback({status: 500});
				} else if(docs.length == 0) {
					callback({status: 404});
				} else {
					callback(null, docs[0]);
				}
			});
		}, function (user, callback) {
			if(passwordHash.verify(password, user.password)) {
				callback(null, user);
			} else {
				callback({status: 401});
			} 
		}], function (error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.send(result);
			}
		});
		
	});

	router.route('/public/register').post(function(req, res) {
		
		async.waterfall([function(callback){
			console.log('validate parameters...');

			var check = validator.isObject()
			.withRequired('email', cirkleValidator.isEmail())
			.withRequired('password');
			
			var userObj = {};
			userObj.email = req.body.email;
			userObj.password = req.body.password;

			validator.run(check, userObj, function(errorCount, errors) {

				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
			});
		}, function(callback) {
			console.log('validating DB...');

			var userscollection = req.db.get('users');
			
			userscollection.find({'email' : req.body.email},{},function(e,docs){
				if(docs.length > 0) {
					callback({status: 400, body: {message: 'USER_EXISTS'}});
				} else {
					callback(null);
				}
			});
			
		}, function(callback) {
			
			var userObj = {};
			userObj.email = req.body.email;
			userObj.password = passwordHash.generate(req.body.password);
			userObj.displayname = req.body.displayname;

			console.log('persisting ' + JSON.stringify(userObj));
			
			var userscollection = req.db.get('users');
			
			userscollection.insert(userObj);
			callback(null);
		}], function (error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.status(200).end();
			}
		});

	});

}
