module.exports = function (app, express, client) {
  var router = express.Router();

  router.route('/users').post(function(req, res) {

    var email = req.query.email;
    var password = req.query.password;
    var displayname = req.query.displayname;
    var query = 'insert into user_(email, password, displayname) values ($1, $2, $3)';

    console.log(query);

    client.query(query, [email, password, displayname], function(err, result) {
      if(err) {
        return response.send(err);
      }
      response.send('OK');
    });
  });

  app.use('/', router);
}
