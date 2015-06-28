module.exports = function (router) {

	var validator = require('../lib/node-validator');
	var async = require('async');

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
		
		var getCirkles = function(callback) {
			
			var cirklescollection = req.db.get('cirkles');
			
			cirklescollection.find({'admin' : req.user._id}, {}, function(e,docs){
				callback(null, JSON.stringify(docs));
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

		async.waterfall([getCirkles], handleError);

	});


	router.route('/cirkles').post(function(req, res) {

		var cirkleName = req.body.cirkleName;

		var validateCirkle = function(callback) {
			console.log('validate parameters...');

			var cirkleObj = {};
			cirkleObj.name = cirkleName;

			var check = validator.isObject().withRequired('name');

			validator.run(check, cirkleObj, function(errorCount, errors) {
				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
			});
		};

		var postCirkle = function(callback) {
			console.log('persisting cirkle ' + cirkleName);
			
			var cirkleObj = {};
			cirkleObj.name = cirkleName;
			cirkleObj.admin = req.user._id;
			cirkleObj.members = req.body.members;
			
			var cirklescollection = req.db.get('cirkles');
			
			cirklescollection.insert(cirkleObj);

			callback(null);
			
		};

		var handleError = function(error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.status(200).end();
			}
		};

		async.waterfall([validateCirkle, postCirkle], handleError);
	});

}
