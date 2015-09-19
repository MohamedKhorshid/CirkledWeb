module.exports = function (router) {

	var validator = require('../lib/node-validator');
	var async = require('async');

	router.route('/cirkles/:cirkleId').get(function(req, res) {
		var cirklescollection = req.db.get('cirkles');
			
		cirklescollection.find({'cirkleId' : req.query.cirkleId}, {}, function(e,docs){
			if(e) {
				res.status(500).end();
			} else if (docs.length == 0) {
				res.status(404).end();
			} else {
				res.status(200);
				res.send(JSON.stringify(docs[0]));
			}
			
		});

	});
	
	router.route('/cirkles/:cirkleId').delete(function(req, res) {
		
		var cirklescollection = req.db.get('cirkles');
		cirklescollection.remove({'_id' : req.params.cirkleId}, {}, function(e, numberOfRemovedDocs){
			if(numberOfRemovedDocs > 0) {
				res.status(200);
			} else {
				res.status(404);
			}
			res.end();
		});

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

		var cirkleObj = {};
		cirkleObj.name = req.body.cirkleName;
		cirkleObj.admin = req.user._id;
		var membersArr = req.body.members;

		cirkleObj.members = [];
		
		for(var i in membersArr) {
			cirkleObj.members.push({'$oid': membersArr[i]});
		}
		

		var validateCirkle = function(callback) {
			console.log('validate parameters...');

			var memberValidator = validator.isObject().withRequired('$oid');
			var check = validator.isObject().withRequired('name')
			.withRequired('admin')
			.withOptional('members', validator.isArray(memberValidator));

			validator.run(check, cirkleObj, function(errorCount, errors) {
				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
			});
		};

		var postCirkle = function(callback) {
			console.log('persisting cirkle ' + cirkleObj.name);
			
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
