var EventApp = angular.module('EventApp', ['angular.filter']);


// Custom Angular filter to convert seconds to minutes
EventApp.filter('secondsToMinutes', function() {
	return function(seconds) {
    var minutes = Math.floor(seconds / 60); 
    return minutes;
	}
});

// Index Controller handles index page communication with backend server.
EventApp.controller('indexController', function($scope, $http) {
	var weekday = new Array(7);
	weekday[0]=  "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	var promise = $http.get('/events');
	promise.then(
		function(payload) {
			data = payload.data;
			for(var i=0; i< data.length; i++) {
				var prevDate = new Date(data[i].start.dateTime);
				// Changing the date and time data to human readable format.
				data[i].start.date =  prevDate.toLocaleDateString();
				data[i].start.dateDay = prevDate.toDateString();
			}
			$scope.events = data;
			
		});

});

// Event Controller handles the detailed event pages communication with backend server.
EventApp.controller('eventController', function($scope, $http) {
	$scope.show = false;
	$scope.uberLookup = {};
	$scope.searchResults = '';

	// Search function to find uber services around a particular location.
	$scope.search = function() {
		$http.get('/uber/services', { params: $scope.uberLookup }).success(function(data) {
			$scope.searchResults = data;
			$scope.show = true;
		});
	}

});