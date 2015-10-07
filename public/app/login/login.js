app.controller('LoginController', function($scope, $location, $http, AuthenticationService) {
	$scope.login = {};
	$scope.loginUser = function() {

		AuthenticationService.ClearCredentials();
		AuthenticationService.Login($scope.login.email, $scope.login.password, function(data, status) {
            if(!status) {
                AuthenticationService.SetCredentials($scope.login.email, $scope.login.password, data.displayname);
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