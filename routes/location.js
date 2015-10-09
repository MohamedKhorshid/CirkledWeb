module.exports = function (router) {

	var validator = require('../lib/node-validator');
	var async = require('async');

	router.route('/locations/cirkle/:cirkleId').get(function(req, res) {

		var cirkleId = req.params.cirkleId;
		
		var validate = function(callback) {
			console.log('validating locations request');

			var locObj = {};
			locObj.cirkleId = cirkleId;

			var check = validator.isObject().withRequired('cirkleId');

			validator.run(check, locObj, function(errorCount, errors) {
				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
			});
		};

		var getCirkles = function(callback) {

			console.log('loading cirkle for members');

			var cirklescollection = req.db.get('cirkles');
			
			cirklescollection.find({'_id' : cirkleId}, {}, function(e,cirkles){
				callback(null, cirkles);
			});
		};

		var getLocations = function(cirkles, callback) {

			if(cirkles.length == 0) {
				callback({status: 404, body: {message:'INVLID_CIRKLE'}});
				return;
			}

			var cirkle = cirkles[0];

			console.log('found cirkle: \'' + cirkle.name + "\', members: " + cirkle.members);
			
			var locationscollection = req.db.get('locations');

			locationscollection.col.group({}, {'user' : { "$in" : cirkle.members}}, {users: {}}, function (obj, prev) {
				if(prev.users[obj.user] == null) {
					prev.users[obj.user] = obj;
				} else if(obj.timestamp > prev.users[obj.user].timestamp) {
					prev.users[obj.user] = obj;
				}
				
			}, function(e,docs){
				var results = [];
				if(docs[0]) {
					for(var doc in docs[0].users) {
						results.push(docs[0].users[doc]);
					}
				}
				
				callback(null, JSON.stringify(results));
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

		async.waterfall([validate, getCirkles, getLocations], handleError);
	});

	router.route('/locations').post(function(req, res) {
		var locObj = {};
			locObj.user = req.user._id;
			locObj.latitude = req.body.latitude;
			locObj.longitude = req.body.longitude;
			locObj.timestamp = new Date();

		var validateLocation = function(callback) {
			console.log('validating location');

			var check = validator.isObject()
			.withRequired('longitude')
			.withRequired('latitude')
			.withRequired('user')
			.withRequired('timestamp');

			validator.run(check, locObj, function(errorCount, errors) {
				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
			});
		};

		var postLocation = function(callback) {
			console.log('persisting location: ' + locObj.longitude + ', ' + locObj.latitude);
			
			var locationscollection = req.db.get('locations');
			
			locationscollection.insert(locObj);

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

		async.waterfall([validateLocation, postLocation], handleError);

	});

}