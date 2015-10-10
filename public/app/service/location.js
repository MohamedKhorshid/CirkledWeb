angular.module('Location', ['Authentication'])
.service('LocationService', function($q, $http, AuthenticationService) {
	var service = {};

	service.postLocation = function (location) {
		console.log('saving location ..');

		$http.post('/api/v1//locations', {longitude: location.lng, latitude: location.lat}).success(function () {
			console.log('saved new location');
		});
	};

	service.getLocation = function () {

		var deferred = $q.defer();

		var _self = this;
		console.log('registring location listener');
		if(!navigator.geolocation) {
			deferred.reject('geolocation not supported by this browser');
			return;
		}

		navigator.geolocation.getCurrentPosition(function(geolocation) {
			console.log('fetched location');
			
			var loc = {lat: geolocation.coords.latitude, lng: geolocation.coords.longitude};
			
			// save new location
			_self.postLocation(loc);
			// send results to caller
			deferred.resolve(loc);
		}, function (error) {
			switch (error.code) {
            	case error.PERMISSION_DENIED:
                    deferred.reject("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    deferred.reject("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    deferred.reject("The request to get user location timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    deferred.reject("An unknown error occurred.");
                    break;
            }
		});

		return deferred.promise;
	};

	return service;
});