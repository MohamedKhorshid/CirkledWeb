module.exports = function (router) {
	var validator = require('../lib/node-validator');
	var cirkleValidator = require('../lib/cirkle-validator');
	var async = require('async');
	
	router.route('/public/login').post(function(req, res) {
		
		var email = req.body.email;
		var password = req.body.password;

		console.log(email + '-' + password)
		
		var userscollection = req.db.get('users');
			
		userscollection.find({'email' : email, 'password' : password},{},function(e,docs){
			if(docs.length > 0) {
				res.status(200);
				res.end();
			} else {
				res.status(400).end();
			}
		});
		
	});

	router.route('/public/register').post(function(req, res) {

		var email = req.body.email;
		var password = req.body.password;
		var displayname = req.body.displayname;

		async.waterfall([function(callback){
			console.log('validate parameters...');

			var check = validator.isObject()
			.withRequired('email', cirkleValidator.isEmail())
			.withRequired('password');
			
			var userObj = {};
			userObj.email = email;
			userObj.password = password;

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
			
			userscollection.find({'email' : email},{},function(e,docs){
				if(docs.length > 0) {
					callback({status: 400, body: {message: 'USER_EXISTS'}});
				} else {
					callback(null);
				}
			});
			
		}, function(callback) {
			
			var userObj = {};
			userObj.email = email;
			userObj.password = password;
			userObj.displayname = displayname;
			
			console.log('persisting ' + userObj);
			
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
