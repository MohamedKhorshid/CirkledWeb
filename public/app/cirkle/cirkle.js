app.controller('CirklesController', function($scope, $http, $modal, $log) {
	$scope.cirkles = [];
	var defaultImgSrc = 'img/cirkle-preview.jpg';
	$scope.newCirkle = function() {
		var modalInstance = $modal.open({
			templateUrl: 'app/cirkle/newcirkle.html',
			controller: 'CirkleController'
		});

		modalInstance.result.then(function (cirkleName) {
			$scope.cirkles.push({'name': cirkleName, 'src' : defaultImgSrc});
		});
	}

	$scope.initCirkles = function() {
		// get cirkles
		$http.get('/api/v1/cirkles').success(function(data) {
			for(var c in data) {
				$scope.cirkles.push({'name': data[c].name, 'src' : defaultImgSrc, 'id': data[c]._id});
			}
			
		});
	}
}).controller('CirkleController', function($scope, $http, $modalInstance, $rootScope) {
	$scope.cirkle = {};
	$scope.addCirkle = function () {
		$http.post('/api/v1/cirkles', {
			'cirkleName': $scope.cirkle.name
		}).success(function(data) {
			$modalInstance.close($scope.cirkle.name);
		});
		
	}
});