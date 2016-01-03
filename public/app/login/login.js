app.controller('LoginController', function($scope, $location, $http, AuthenticationService) {
	
	FB.init({
		appId      : '189638081373999',
		xfbml      : true,
		version    : 'v2.5'
	});
	
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
	
	$scope.fbLogin = function () {
		FB.login(function(response){
			if (response.authResponse) {
				FB.api('/me', function(response) {
					console.log(response);
				});
			} else {
				alert('failed to authenticate through fb');
			}
		}, {scope: 'public_profile,email'});
	}
});