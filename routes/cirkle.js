module.exports = function (router) {

	var validator = require('../lib/node-validator');
	var async = require('async');

	router.route('/cirkles/:cirkleId').get(function(req, res) {
		var cirklescollection = req.db.get('cirkles');

		console.log(req.params.cirkleId);

		cirklescollection.find({'_id' : req.params.cirkleId}, {}, function(e,docs){
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
		var membersArr = eval(req.body.members);

		console.log('received cirkle ' + cirkleObj.name + ' with members :' + membersArr);

		cirkleObj.members = [];
		
		var userscollection = req.db.get('users');
		var x = 0;

		var fetchMembers = function(callback) {

			if(!membersArr || x >= membersArr.length) {
				callback(null);
				return;
			}

			var memberId = membersArr[x];
			userscollection.find({'_id' : memberId}, {}, function(e,docs){
				console.log('fetch member ' + memberId + ' results: ' + JSON.stringify(docs));
				if(e) {
					callback({status: 500});
				} else if (docs.length == 0) {
					callback({status: 404});
				} else if (docs.length > 1) {
					res.status(400).end();
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					member = docs[0];
					cirkleObj.members.push(member._id);
					x++;
					fetchMembers(callback);

				}
				
			});
		};

		var validateCirkle = function(callback) {
			console.log('validate parameters...');

			var check = validator.isObject().withRequired('name')
			.withRequired('admin')
			.withOptional('members', validator.isArray());

			validator.run(check, cirkleObj, function(errorCount, errors) {
				if(errorCount > 0) {
					console.log('invalid cirkle ' + errors);
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					console.log('valid cirkle');
					callback(null);
				}
			});
		};

		var postCirkle = function(callback) {
			console.log('persisting cirkle ' + JSON.stringify(cirkleObj));
			
			var cirklescollection = req.db.get('cirkles');
			
			var savedCirkle = cirklescollection.insert(cirkleObj);

			callback(null, savedCirkle.query);
			
		};

		var handleError = function(error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.send({'name' : result.name, '_id' : result._id});
			}
		};
		async.waterfall([fetchMembers, validateCirkle, postCirkle], handleError);
	});

	router.route('/cirkles/:cirkleId/members').get(function(req, res) {

		var cirkleId = req.params.cirkleId;
		
		var validate = function(callback) {
			console.log('validating request');

			var cirkleObj = {};
			cirkleObj.cirkleId = cirkleId;

			var check = validator.isObject().withRequired('cirkleId');

			validator.run(check, cirkleObj, function(errorCount, errors) {
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

		var getMembers = function(cirkles, callback) {

			if(cirkles.length == 0) {
				callback({status: 404, body: {message:'INVLID_CIRKLE'}});
				return;
			}

			var cirkle = cirkles[0];

			console.log('found cirkle: \'' + cirkle.name + "\', members: " + cirkle.members);
			
			var userscollection = req.db.get('users');

			userscollection.find({'_id' : { "$in" : cirkle.members}}, {}, function(e,data){
				console.log(data);
				callback(null, data);
			});
			
		};

		var cropUserDetails = function (members, callback) {

			var _members = [];

			if(!members) {
				callback(null, []);
			}

			var display;
			for(var m in members) {
				if(members[m].displayname) {
					display = members[m].displayname;
				} else {
					display = members[m].email;
				}
				_members.push({'_id' : members[m]._id, 'displayname' : display});
			}

			callback(null, _members);

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

		async.waterfall([validate, getCirkles, getMembers, cropUserDetails], handleError);
	});

	router.route('/cirkles/:cirkleId/members').post(function(req, res) {

		var cirkleId = req.params.cirkleId;
		var members = req.body;
		var _members = [];

		var userscollection = req.db.get('users');
		var x = 0;
		
		if(!members) {
			callback({status: 400, body: {message:'INVALID_REQUEST'}});
		}

		var validate = function(callback) {
			console.log('validating request');

			var cirkleObj = {};
			cirkleObj.cirkleId = cirkleId;

			var check = validator.isObject().withRequired('cirkleId');

			validator.run(check, cirkleObj, function(errorCount, errors) {
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

		var fetchMembers = function(callback) {

			if(!members || x >= members.length) {
				callback(null);
				return;
			}

			var memberId = members[x];
			userscollection.find({'_id' : memberId}, {}, function(e,docs){
				console.log('fetch member ' + memberId + ' results: ' + JSON.stringify(docs));
				if(e) {
					callback({status: 500});
				} else if (docs.length == 0) {
					callback({status: 404});
				} else if (docs.length > 1) {
					res.status(400).end();
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					_members.push(docs[0]._id);
					x++;
					fetchMembers(callback);

				}
				
			});
		};

		var addMembers = function(cirkles, callback) {

			if(cirkles.length == 0) {
				callback({status: 404, body: {message:'INVLID_CIRKLE'}});
				return;
			}

			var cirkle = cirkles[0];

			console.log('found cirkle: \'' + cirkle.name + "\', members: " + cirkle.members);

			if(!cirkle.members) {
				cirkle.members = [];
			}
			
			for(var m in _members) {
				cirkle.members.push(_members[m]);
			}

			var cirklescollection = req.db.get('cirkles');

			cirklescollection.update(cirkleId, {$set: { "members": cirkle.members }}, {}, function () {
				callback(null);
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

		async.waterfall([validate, fetchMembers, getCirkles, addMembers], handleError);
	});

}
