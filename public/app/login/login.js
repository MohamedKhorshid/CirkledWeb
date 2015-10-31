app.controller('LoginController', function($scope, $location, $http, AuthenticationService) {
	$scope.login = {};
	$scope.loginUser = function() {

		AuthenticationService.clearCredentials();
		AuthenticationService.login($scope.login.email, $scope.login.password, function(data, status) {
            if(!status) {
                AuthenticationService.setCredentials(data.email, data.password, data.displayname);
                $location.path('/');
            } else {
                alert('Invlid Login');
            }
        });
	}

	$scope.newUser = function() {
		$location.path('/register');
	}
});