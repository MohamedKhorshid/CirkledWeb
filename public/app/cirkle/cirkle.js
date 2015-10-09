app.controller('CirklesController', function($scope, $http, $modal, $location) {
	$scope.cirkles = [];
	var defaultImgSrc = 'img/cirkle-preview.jpg';
	$scope.newCirkle = function() {
		var modalInstance = $modal.open({
			templateUrl: 'app/cirkle/newcirkle.html',
			controller: 'NewCirkleController'
		});

		modalInstance.result.then(function (cirkleName) {
			$scope.cirkles.push({'name': cirkleName, 'ico' : defaultImgSrc});
		});
	}

	$scope.initCirkles = function() {
		// get cirkles
		$http.get('/api/v1/cirkles').success(function(data) {
			for(var c in data) {
				$scope.cirkles.push({'name': data[c].name, 'ico' : defaultImgSrc, 'id': data[c]._id});
			}
			
		});
	}

	$scope.openCirkle = function (id) {
		$location.path('/cirkle/' + id);
	}

}).controller('NewCirkleController', function($scope, $http, $modalInstance, $rootScope) {
	$scope.cirkle = {};
	$scope.addCirkle = function () {
		$http.post('/api/v1/cirkles', {
			'cirkleName': $scope.cirkle.name
		}).success(function(data) {
			$modalInstance.close($scope.cirkle.name);
		});
		
	}
}).controller('CirkleController', function($scope, $http, $rootScope) {
	$scope.cirkle = {};
}).controller('MembersController', function($scope, $http, $routeParams) {
	$scope.members = [];

	var cirkleId = $routeParams.cirkleId;

	var defaultImgSrc = 'img/user-preview.jpg';

	$('#add_member').autocomplete({source: function (request, response) {
		if(!request.term) {
			return;
		}
		$http.get('/api/v1/search/users?searchText=' + request.term).success(function (data) {
			var members_ac = [];
			if(!data) {
				return;
			}
			console.log(data);
			for(var m in data) {
				members_ac.push({label: data[m].displayname, obj : data[m]});
			}
			response(members_ac);
		});

	}, select: function (event, object) {
		console.log(object);
		
		if(!object.item.obj || !object.item.obj._id) {
			return;
		}
		
		$http.post('/api/v1/cirkles/' + cirkleId + '/members', [object.item.obj._id]).success(function () {
			$scope.initMembers();
		});

		$('#add_member').val('');
	}});

	$scope.initMembers = function () {
		$http.get('/api/v1/cirkles/' + cirkleId + '/members').success(function (data) {
			$scope.members = [];
			for(var x in data) {
				var member = data[x];
				$scope.members.push({'name' : member.displayname, 'ico': defaultImgSrc});;
			}
		});
	}

});