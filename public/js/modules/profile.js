/**
 * Profile module
 */

!function () {
	/**
	 * User profile controller
	 */
    NSPraxManager.controller('ProfileController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
	$scope.user = {}
	
	$http.get('/api/my').success(function (data, status, headers, config){
	    $scope.user = data
	})
	
	/**
	 * Change password of the current user
	 */
	$scope.changePassword = function () {
	    $modal.open({
		      templateUrl: 'changePasswordModal.html',
		      controller: 'ChangePasswordModalController',
		    });
	}
	
	/**
	 * Save profile options
	 */
	$scope.saveProfile = function () {
	    $http.put('/api/my', $scope.user)
	    .success(function () {
		
	    });
	};
    }]);
    
	/**
	 * Change password modal contrller
	 */
    NSPraxManager.controller('ChangePasswordModalController', ['$scope', '$modalInstance','$http', function ($scope, $modalInstance, $http) {
	
	$scope.user = {};
	
	/**
	 * Change user password
	 */
	$scope.changePassword = function () {
	    
	    $http.put('/api/my/change_password', $scope.user)
	    .success(function () {
		$modalInstance.close({});
	    })
	    .error(function () {
		console.log('error');
	    });
	};

	/**
	 * Close modal
	 */
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
    }]);

}();
