/**
 * My Internships Summary module
 */
!function () {
	/**
	 * Student internship summary controller
	 */
    NSPraxManager.controller('MyInternshipSummaryController', ['$scope', '$http', '$q',function ($scope, $http, $q) {
		$scope.internship = {};
		$scope.timeSum = 0;
		$scope.user = {};

		var internshipDeferred = $q.defer();
		var userDeferred = $q.defer();

		$http.get('/api/internships/' + PraxManager_internshipId).success(function (internship) {
			$scope.internship = internship;
			internshipDeferred.resolve(internship);
		});

		$http.get('/api/checkin/my_checkins?internshipId=' + PraxManager_internshipId)
			.success(function (data) {
				$scope.checkins = data;
				$scope.checkins.forEach(function (checkin) {
					if (checkin.Status == 'approved') {
						$scope.timeSum += checkin.Time;
					}
				});
			});

		$http.get('/api/my').success(function (user) {
			$scope.user = user;
			userDeferred.resolve(user);
		});

		$q.all([internshipDeferred.promise, userDeferred.promise]).then(function () {
			var found = $scope.internship.AssignedUsers.find(function (user) {
				return user._id === $scope.user._id;
			});

			if (!found) {
				return;
			}

			$scope.finalGrade = found.finalGrade;
		});

    }]);
} ();