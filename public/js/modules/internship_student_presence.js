/**
 * Internship student presence module
 */


!function () {
    /**
     * Internship student presence controller
     */
   NSPraxManager.controller('InternshipStudentPresenceController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
       $scope.internship = {};
       $scope.currentUser = {};
       $scope.timeSum = 0;
       
       $http.get('/api/internships/' + PraxManager_internshipId).success(function (internship) {
	         $scope.internship = internship;
       })
       
       $http.get('/api/users/' + PraxManager_studentId).success(function (student) {
	         $scope.student = student;
       });
       
       $http.get('/api/checkin/query?internshipId=' + PraxManager_internshipId +'&userId='+ PraxManager_studentId).success(function (checkins) {
	         $scope.checkins = checkins;
            $scope.checkins.forEach(function (checkin) {
              $scope.timeSum += checkin.Time;
            });
       });
       
       /**
        * Send student notification
        */
      $scope.sendStudentNotification = function (student) {
	   // @TODO
      };
       
       /**
        * Edit submited checkin
        */
       $scope.editCheckin = function (checkin){

          var modalInstance = $modal.open({
            templateUrl: 'presenceModal.html',
            controller: 'PresenceModalController',
            size: 'md',
            resolve: {
              checkin: function () {
                return checkin;
              }
            }
            });
            
            modalInstance.result.then(function (question) {

            }, function () {
              // no result
            });
       };
       

   }]);

    /**
     * Presence modal controller
     */
    NSPraxManager.controller('PresenceModalController', ['$scope', '$modalInstance', '$http','checkin', function ($scope, $modalInstance, $http, checkin) {
      $scope.checkin = checkin;

      /**
       * Close modal 
       */
      $scope.close = function () {
          $modalInstance.dismiss('cancel');
      };

      /**
       * Save checkin changes
       */
      $scope.save = function () {
        $http.put('/api/checkin/'+ checkin._id, $scope.checkin)
        .success(function (updated_checkin) {
          $modalInstance.close(updated_checkin);
        });
      }
      
    }]);
}()