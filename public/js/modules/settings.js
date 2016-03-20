/**
 * Settings module 
 */


!function () {
	/**
	 * User profile controller
	 */
    NSPraxManager.controller('SettingsController', ['$scope', function ($scope) {
        $scope.language = PraxManager_lang;
        $scope.notifications = 'all';
        $scope.timezone = 'utc';
    }]);
}();