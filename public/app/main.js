var app = angular.module('mainApp', ['ngRoute', 'ngCookies', 'Authentication', 'ui.bootstrap']);

// config
app.config(function ($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl : 'app/home.html'
	})
	.when('/register', {
		templateUrl : 'app/registration/registration.html',
		controller : 'RegistrationController'
	})
	.when('/login', {
		templateUrl : 'app/login/login.html',
		controller : 'LoginController'
	})
	.otherwise({ redirectTo: '/' });
});

app.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }
 
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
}]);

app.controller('HomeController', function($scope, $rootScope) {
	$scope.isRegistered = false;

	$scope.verifyLogin = function () {
		if($rootScope.globals.currentUser) {
			$scope.isRegistered = true;
			$scope.displayname = $rootScope.globals.currentUser.displayname;
		}
	};
});