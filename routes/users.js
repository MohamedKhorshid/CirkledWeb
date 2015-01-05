module.exports = function (app, express, client) {

  var router = express.Router();
  var bodyParser = require('body-parser');

  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({extended: true}));

  router.route('/users').post(function(req, res) {

    var email = req.body.email;
    var password = req.body.password;
    var displayname = req.body.displayname;
    var query = 'insert into user_(email, password, displayname) values ($1, $2, $3)';

    console.log(query + '. Parameters: email='+ email + ', password='+ password + ', displayname='+ displayname);

    client.query(query, [email, password, displayname], function(err, result) {
      if(err) {
        console.log("Error: " + err);
        return res.send(err);
      }
      res.send('OK');
    });
  });

  app.use('/', router);
}
