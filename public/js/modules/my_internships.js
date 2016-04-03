/**
 * My Internships module
 */

!function() {
	/**
	 * Student internships controller
	 */
    NSPraxManager.controller('MyInternshipsController', ['$scope', '$http', '$modal', function($scope, $http, $modal) {
		$scope.internships = {}

		$http.get('/api/internships/my').success(function(data, status, headers, config) {
			$scope.internships = data.filter(function(internship) {
				var days = 0;
				if (internship.CompletionLimit == 'last3days') {
					days = 3;
				}

				if (internship.CompletionLimit == 'last7days') {
					days = 7;
				}

				if (internship.CompletionLimit == 'last30days') {
					days = 30;
				}
				
				var end = moment(internship.EndDate);
				end.add(days, 'days');
				var internshipEnded = !end.utc().isBefore(moment().utc());
				return internshipEnded;
			});
		})

    }]);
} ();

