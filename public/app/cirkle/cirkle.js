app.controller('CirklesController', function($scope, $http, $modal, $location) {
	$scope.cirkles = [];
	var defaultImgSrc = 'img/cirkle-preview.jpg';
	$scope.newCirkle = function() {
		var modalInstance = $modal.open({
			templateUrl: 'app/cirkle/newcirkle.html',
			controller: 'NewCirkleController'
		});

		modalInstance.result.then(function (cirkle) {
			$scope.cirkles.push({'name': cirkle.name, 'ico' : defaultImgSrc, 'id': cirkle._id});
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
			$modalInstance.close(data);
		});
		
	}
}).controller('CirkleController', function($scope, $http, $routeParams, LocationService) {
	var cirkleId = $routeParams.cirkleId;
	var defaultImgSrc = 'img/user-preview.jpg';

	$scope.locations = {};
	$scope.mapLocations = {};
	$scope.members = {};

	$scope.init = function() {

		$scope.initLocations();

		LocationService.getLocation().then(function(location) {
			console.log('location:success:' + location);
			$scope.myLocation = location;
			processMyLocation(location);
		}, function (error) {
			console.log('location:fail:' + error);
		});

		$scope.map = new google.maps.Map(document.getElementById('cl-map'), {
			center: $scope.myLocation || {lat: 0, lng: 0},
			zoom: 16
		});
		
		processMyLocation($scope.myLocation);

		recalculateMapBounds();

	}

	$scope.initMembers = function () {
		$http.get('/api/v1/cirkles/' + cirkleId + '/members').success(function (data) {
			$scope.members = {};
			for(var x in data) {
				var member = data[x];
				$scope.members[member._id] = {'name' : member.displayname, 'ico': defaultImgSrc};
			}
		});
	}

	$scope.initLocations = function () {
		$http.get('/api/v1/locations/cirkle/' + cirkleId).success(function (locations) {
			$scope.locations = {};
			for(var l in locations) {
				var location = locations[l];
				$scope.locations[location.user] = location;
			}
			fixLocations();
		});
	}

	$scope.selectMember = function (memberId) {
		if(!$scope.map) {
			console.error('could not find map');
			return;
		}

		if(!$scope.mapLocations[memberId]) {
			console.log('could not find member location');
			return;
		}

		$scope.map.panTo($scope.mapLocations[memberId].position);

	}

	var fixLocations = function () {
		if($scope.mapLocations) {
			$scope.clearMarkers();
		}

		$scope.mapLocations = {};

		for(var l in $scope.locations) {
			var location = $scope.locations[l];

			var position = {lat: Number(location.latitude), lng: Number(location.longitude)};

			var marker = new google.maps.Marker({
				position: position,
				map: $scope.map
			});

			$scope.mapLocations[l] = {'position': position, 'marker': marker}
		}

		recalculateMapBounds();
	}

	var processMyLocation = function () {

		if(!$scope.myLocation || !$scope.map) {
			return;
		}

		$scope.myMarker = new google.maps.Marker({
			position: $scope.myLocation,
			map: $scope.map
		});

		recalculateMapBounds();

	}

	$scope.clearMarkers = function () {
		for(var l in $scope.mapLocations) {
			var location = $scope.mapLocations[l];
			location.marker.setMap(null);
		}
	}

	var recalculateMapBounds = function () {
		
		var bounds = new google.maps.LatLngBounds();

		if ($scope.mapLocations) {
			for (var l in $scope.mapLocations) {
				var position = $scope.mapLocations[l].position;
				bounds.extend(new google.maps.LatLng(position.lat, position.lng));
			}
		}

		if($scope.myLocation) {
			bounds.extend(new google.maps.LatLng($scope.myLocation.lat, $scope.myLocation.lng));
		}

		$scope.map.fitBounds(bounds);
		
	};

	$('#add_member').autocomplete({source: function (request, response) {
		if(!request.term) {
			return;
		}
		$http.get('/api/v1/search/users?searchText=' + request.term).success(function (data) {
			var members_ac = [];
			if(!data) {
				return;
			}
			for(var m in data) {
				members_ac.push({label: data[m].displayname, obj : data[m]});
			}
			response(members_ac);
		});

	}, select: function (event, object) {
		if(!object.item.obj || !object.item.obj._id) {
			return;
		}
		
		$http.post('/api/v1/cirkles/' + cirkleId + '/members', [object.item.obj._id]).success(function () {
			$scope.clearMarkers();
			$scope.initLocations();
			$scope.initMembers();
		});
		$('#add_member').val('');
	}});

});