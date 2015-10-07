app.controller('RegistrationController', function($scope, $location, $http) {
	$scope.newUser = {};
	$scope.registerUser = function() {

		if($scope.newUser.password !== $scope.newUser.password2) {
			alert('password mismatch');
			return;
		}

		$http.post('/api/v1/public/register', {
			'email' : $scope.newUser.email, 
			'password': $scope.newUser.password, 
			'displayname': $scope.newUser.displayname
		}).success(function(data) {
			$location.path('/');
		}).error(function(data, status) {
			alert('Invalid Registration');
		});
	}

	$scope.login = function() {
		$location.path('/login');
	}
});