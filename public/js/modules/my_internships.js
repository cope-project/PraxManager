/**
 * My Internships module
 */

!function () {
	/**
	 * Student internships controller
	 */
    NSPraxManager.controller('MyInternshipsController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
	$scope.internships = {}
	
	$http.get('/api/internships/my').success(function (data, status, headers, config){
	    $scope.internships = data
	})
	
    }]);
}();

