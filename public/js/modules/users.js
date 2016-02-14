/**
 * Users module
 */

!function () {
	/**
	 * Users controller
	 */
    NSPraxManager.controller('UsersController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
		$scope.users = [];
	
		/**
		 * Load users
		 */
		function loadUsersFromServer() {
			$http.get('/api/users').success(function (users) {
				$scope.users = users;
			});
		}

		loadUsersFromServer();
	
	
		/**
		 * Add new user
		 */
		$scope.addUser = function () {
			var modalInstance = $modal.open({
				templateUrl: 'editUserModal.html',
				controller: 'EditUserModalController',
				size: 'lg',
				resolve: {
					user: function () {
						return {};
					}
				}
			});
			modalInstance.result.then(loadUsersFromServer, function () {});
		};
	
		/**
		 * Edit user
		 */
		$scope.editUser = function (user) {
			var modalInstance = $modal.open({
				templateUrl: 'editUserModal.html',
				controller: 'EditUserModalController',
				size: 'lg',
				resolve: {
					user: function () {
						return user;
					}
				}
			});

			modalInstance.result.then(loadUsersFromServer, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
	
		/**
		 * Send new password to user
		 */
		$scope.sendPassword = function (user) {
			var modalInstance = $modal.open({
				templateUrl: 'sendUserPasswordModal.html',
				controller: 'SendPasswordModalController',
				resolve: {
					user: function () {
						return user;
					}
				}
			});
		};
	
		/**
		 * Delete user
		 */
		$scope.deleteUser = function (user) {
			if (!confirm("Are you sure you want to delete this user.")) {
				return;
			}
			$http.delete('/api/users/' + user._id)
				.success(loadUsersFromServer);
		};
		
		$scope.uploadUsers = function () {
			var modalInstance = $modal.open({
				templateUrl: 'uploadUsers.html',
				controller: 'UploadUsersModalController',
				resolve: {}
			});
			
			modalInstance.result.then(loadUsersFromServer, function () {});
		};
    }]);
    
    /**
	 * Edit user modal controller
	 */
    NSPraxManager.controller('EditUserModalController', ['$scope', '$http', '$modalInstance', 'user',
		function ($scope, $http, $modalInstance, user) {

			$scope.user = user;
			$scope.error = false;
	
			/**
			 * Close modal
			 */
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
	
			/**
			 * Save user form
			 */
			$scope.saveUser = function () {
				var method = $scope.user._id == undefined ? $http.post : $http.put;
				var url = $scope.user._id == undefined ? '/api/users' : '/api/users/' + $scope.user._id;
				method(url, $scope.user)
					.success(function () {
						$modalInstance.close($scope.user);
					})
					.error(function () {
						$scope.error = true;
					});
			};
		}]);
    
	/**
	 * Send password modal controller
	 */
    NSPraxManager.controller('SendPasswordModalController', ['$scope', '$modalInstance', '$http', 'user', function ($scope, $modalInstance, $http, user) {
		$scope.user = user;
		$scope.error = false
		$scope.sendPasswordLock = false;
	
		/**
		 * Close modal
		 */
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	
		/**
		 * Send password via email
		 */
		$scope.sendPassword = function () {
			$scope.sendPasswordLock = true;
			$http.put('/api/users/send_password/' + $scope.user._id, {})
				.success(function () {
					$modalInstance.close($scope.user);
					$scope.sendPasswordLock = false;
				})
				.error(function () {
					$scope.error = true;
					$scope.sendPasswordLock = false;
				});
		};

    }]);
	
/**
 * Upload users modal controller
 */
    NSPraxManager.controller('UploadUsersModalController', ['$scope', '$modalInstance', '$http', 
	function ($scope, $modalInstance, $http, user) {
		$scope.error = false
		$scope.uploading = false;
		$scope.uploaded = false;
		$scope.response = {};
	
		/**
		 * Close modal
		 */
		$scope.close = function () {
			if($scope.uploaded){
				$modalInstance.close({});
			}else{
				$modalInstance.dismiss('cancel');
			}
		};
	
		/**
		 * Send password via email
		 */
		$scope.uploadUsers = function (e) {
			e.preventDefault();
			 var form = angular.element(e.target);
			 $scope.uploading = true;
			 uploadForm(form);
		};
		
		/**
		 * Upload file form
		 */
		function uploadForm (form) {

			$(form).ajaxSubmit({error: function(xhr) {
				$scope.$apply(function($scope) {
					$scope.uploading = false;
					if(xhr.responseJSON){
						$scope.error = xhr.responseJSON.Message;
						return;
					}
				
				$scope.error = 'File upload error.'
				
				})}, success: function(response) {
					$scope.$apply(function($scope) {
						$scope.uploading = false;
						$scope.uploaded  = true;
						$scope.error = false;
						$scope.response = response;
					});
				}
			});
		}

    }]);
} ();