module.exports = function (app, express, client) {

  var router = express.Router();
  var bodyParser = require('body-parser');
  var validator = require('../lib/node-validator');
  var cirkleValidator = require('../lib/cirkle-validator');
  var async = require('async');

  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({extended: true}));

router.route('/users').get(function(req, res) {});

	router.route('/users').post(function(req, res) {
		var email = req.body.email;
    var password = req.body.password;
    var displayname = req.body.displayname;

		async.waterfall([function(callback){
			console.log('validate parameters...');

	    var userObj = {};
		  userObj.email = email;
		  userObj.password = password;

			var check = validator.isObject()
		    .withRequired('email', cirkleValidator.isEmail())
		    .withRequired('password');

			validator.run(check, userObj, function(errorCount, errors) {

				if(errorCount > 0) {
					callback({status: 400, body: {message:'INVALID_REQUEST'}});
				} else {
					callback(null);
				}
    	});
		}, function(callback) {
			console.log('validating DB...');
			
			var alreadyExistsQuery = 'select email from user_ where email = $1';
			console.log(alreadyExistsQuery + '. Parameters: email='+ email);

			var exists = false;
			client.query(alreadyExistsQuery, [email], function(err, result) {
				if(result.rows.length > 0) {
					callback({status: 400, body: {message: 'USER_EXISTS'}});
				} else {
					callback(null);
				}
			});
		}, function(callback) {
			console.log('persisting...');
			var query = 'insert into user_(email, password, displayname) values ($1, $2, $3)';

	    console.log(query + '. Parameters: email='+ email + ', password='+ password + ', displayname='+ displayname);

	    client.query(query, [email, password, displayname], function(err, result) {
	      if(err) {
	        console.log("Error while persisting user: " + err);
	        callback({status: 500, body: {}});
	      } else {
	        callback(null);
	      }
	    });
		}], function (error, result) {
			if(error) {
			  res.status(error.status);
			  res.send(error.body);
			} else {
				res.status(200).end();
			}
		});

	});

  app.use('/', router);
}
