/**
 * Inbox module
 */

!function () {
    /**
     * Inbox controller
     */
   NSPraxManager.controller('InboxController', ['$scope', '$http', function ($scope, $http) {
       $scope.notifications = []
       
       $http.get('/notifications').success(function (notifications) {
	   $scope.notifications = notifications
       })
   }])
}()
