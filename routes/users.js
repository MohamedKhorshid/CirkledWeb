module.exports = function (app, express, client) {

  var router = express.Router();
  var bodyParser = require('body-parser');
  var validator = require('node-validator');
  var cirkleValidator = require('../lib/cirkle-validator');

  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({extended: true}));

  router.route('/users').post(function(req, res) {

    var email = req.body.email;
    var password = req.body.password;
    var displayname = req.body.displayname;

    var userObj = {};
    userObj.email = email;
    userObj.password = password;
    userObj.displayname = displayname;

    // validate parameters
    var check = validator.isObject()
      .withRequired('email', cirkleValidator.isEmail()) 
      .withRequired('password')
      .withOptional('displayname');

    validator.run(check, userObj, function(errorCount, errors){
      console.log('errorCount :' + errorCount);
      console.log('errors :' + errors);
    });

    var query = 'insert into user_(email, password, displayname) values ($1, $2, $3)';

    console.log(query + '. Parameters: email='+ email + ', password='+ password + ', displayname='+ displayname);

    client.query(query, [email, password, displayname], function(err, result) {
      if(err) {
        console.log("Error: " + err);
        res.status(500);
        res.send(err);
      }
      res.status(200).end();
    });
  });

  app.use('/', router);
}
