module.exports = function (app, express) {
  var router = express.Router();

  router.route('/users').post(function(req, res) {
    // handle new user here
  });

  app.use('/', router);
}
