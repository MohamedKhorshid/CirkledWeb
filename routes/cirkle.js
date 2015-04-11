module.exports = function (router) {

	router.route('/cirkle').get(function(req, res) {
		/*client.query('select * from cirkle where cirkleid = $1', [req.query.cirkleId], function(err, result) {
				if(result.rowCount > 0) {
					res.status(200);
					res.send(result.rows[0]);
				} else {
					res.status(400).end();
				}
		});*/

		res.status(200);
		var cirkle = {};
		cirkle.cirkleId = 1;
		cirkle.cirkleName = 'My Family';
		cirkle.members = [
			{id: '1', email: 'mohamed@wagdy.com', displayName: 'Mohamed Wagdy', isOwner: 'true'},
			{id: '2', email: 'wagdy@khorshid.com', displayName: 'Wagdy Khorshid', isOwner: 'false'},
			{id: '3', email: 'amal@gazzar.com', displayName: 'Amal El-Gazzar', isOwner: 'false'}
		];

		res.send(cirkle);

	});

}
