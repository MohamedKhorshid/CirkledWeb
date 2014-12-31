module.exports = function (app, express) {
  var router = express.Router();

  router.route('/users').get(function(req, res) {
    res.send('hello :)');
  }).post(function(req, res) {
    res.send('hello post :)');
  });

  app.use('/', router);
}
