/**
 * Export module
 */
!function () {
    /**
     * Export page controller
     */
   NSPraxManager.controller('ExportController', ['$scope', '$http', function ($scope, $http) {
       $scope.internships = [];
       
       $http.get('/api/internships')
       .success(function (internships){
	   $scope.internships = internships;
       });
       
       $http.get('/api/forms')
       .success(function (forms){
	   $scope.forms = forms;
       });
   }]);
}()