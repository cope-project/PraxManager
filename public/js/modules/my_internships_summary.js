/**
 * My Internships Summary module
 */
!function () {
	/**
	 * Student internship summary controller
	 */
    NSPraxManager.controller('MyInternshipSummaryController', ['$scope', '$http', function ($scope, $http) {
    	$scope.internship = {};
    	$scope.timeSum = 0;

    	$http.get('/api/internships/'+ PraxManager_internshipId).success(function (internship) {
    		$scope.internship = internship;
    	});

    	$http.get('/api/checkin/my_checkins?internshipId='+PraxManager_internshipId)
		.success(function (data) {
			$scope.checkins = data;
			$scope.checkins.forEach(function (checkin) {
			    if(checkin.Status == 'approved'){
				$scope.timeSum += checkin.Time;
			    }
			});
		});

    }]);
}();