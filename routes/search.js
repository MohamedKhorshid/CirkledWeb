module.exports = function (router) {
  var validator = require('../lib/node-validator');
  var cirkleValidator = require('../lib/cirkle-validator');
  var async = require('async');
  var client = require('../lib/db').client;

	router.route('/search/users').get(function(req, res) {
		var validateRequest = function(callback) {

			var obj = {};
			  obj.searchText = req.query.searchText;

				var check = validator.isObject().withRequired('searchText');

				validator.run(check, obj, function(errorCount, errors) {
					if(errorCount > 0) {
						callback({status: 400, body: {message:'INVALID_REQUEST'}});
					} else {
						callback(null, obj.searchText);
					}
			});
		};

		var searchUser = function(searchText, callback) {
			var userSearch = eval('/' + searchText + '/');
			
			var userscollection = req.db.get('users');
			
			userscollection.find({'displayname' : userSearch},{},function(e,docs){
				callback(null, JSON.stringify(docs));
			});
		};

		var handleResults = function(error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.status(200);
				res.send(result);
			}
		};

		async.waterfall([validateRequest, searchUser], handleResults);
	});

}