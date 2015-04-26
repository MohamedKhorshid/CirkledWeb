module.exports = function (router) {

	var validator = require('../lib/node-validator');
	var async = require('async');
	var client = require('../lib/db').client;

	router.route('/cirkle').get(function(req, res) {
		/*client.query('select * from cirkle where cirkleid = $1', [req.query.cirkleId], function(err, result) {
				if(result.rowCount > 0) {
					res.status(200);
					res.send(result.rows[0]);
				} else {
					res.status(400).end();
				}
		});*/

		res.status(200);
		res.send({});

	});

	router.route('/cirkles').get(function(req, res) {

		var validateRequest = function(callback) {

	    var obj = {};
		  obj.email = req.query.email;

			console.log('validate parameters ' + JSON.stringify(obj));

			var check = validator.isObject().withRequired('email');

			validator.run(check, obj, function(errorCount, errors) {
				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
    	});
		};

		var getUser = function(callback) {

			console.log('looking up user...');

			client.query('select * from user_ where email = $1', [req.query.email], function(err, result){
				if(err) {
	        console.log("Error while fetching user " + cirkleAdminEmail + " : " + err);
	        callback({status: 500, body: {}});
	      } else if (result.rows.length == 0) {
					console.log("Cannot find user : " + req.query.email);
	        callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
	        callback(null, result.rows[0]);
	      }
				
			});
		};
		
		var getCirkles = function(user, callback) {
			client.query('select * from cirkle where admin = $1', [user.userid], function(err, result) {
				if(err) {
	        console.log("Error while fetching cirkles: " + err);
	        callback({status: 500, body: {}});
	      } else {
	        callback(null, JSON.stringify(result.rows));
	      }
			});
		};

		var handleError = function(error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.status(200);
				res.send(result);
			}
		};

		async.waterfall([validateRequest, getUser, getCirkles], handleError);

	});


	router.route('/cirkle').post(function(req, res) {

		var cirkleName = req.body.cirkleName;
		var cirkleAdminEmail = req.body.admin;

		var getAdmin = function(callback) {

			console.log('looking up admin...');

			client.query('select * from user_ where email = $1', [cirkleAdminEmail], function(err, result){
				if(err) {
	        console.log("Error while fetching user " + cirkleAdminEmail + " : " + err);
	        callback({status: 500, body: {}});
	      } else if (result.rows.length == 0) {
					console.log("Cannot find user as admin: " + cirkleAdminEmail);
	        callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
	        callback(null, result.rows[0]);
	      }
				
			});
		};

		var validateCirkle = function(callback) {
			console.log('validate parameters...');

	    var cirkleObj = {};
		  cirkleObj.name = cirkleName;
		  cirkleObj.admin = cirkleAdminEmail;

			var check = validator.isObject().withRequired('name').withRequired('admin');

			validator.run(check, cirkleObj, function(errorCount, errors) {
				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
    	});
		};

		var postCirkle = function(admin, callback) {
			console.log('persisting cirkle ' + cirkleName + ' for admin ' + JSON.stringify(admin));

	    client.query('insert into cirkle(name, admin) values ($1, $2)', [cirkleName, admin.userid], function(err, result) {
	      if(err) {
	        console.log("Error while persisting cirkle: " + err);
	        callback({status: 500, body: {}});
	      } else {
	        callback(null);
	      }
	    });
		};

		var handleError = function(error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.status(200).end();
			}
		};

		async.waterfall([validateCirkle, getAdmin, postCirkle], handleError);
	});

}
