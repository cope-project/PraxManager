/**
 * Internship students module
 */

!function () {
    /**
     * Internshp students controller
     */
   NSPraxManager.controller('InternshipStudentsController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
       $scope.internship = {};
       $scope.internshipStudents = [];
       
       $http.get('/api/internships/' + PraxManager_internshipId).success(function (internship) {
	       $scope.internship = internship;
           $scope.internshipStudents = [].concat(internship.AssignedUsers, internship.AssignedAdministrators);
       });
       
         /**
          * Send student notification via email
          */
         $scope.sendStudentNotification = function (student){

          var modalInstance = $modal.open({
            templateUrl: 'sendNotification.html',
            controller: 'NotificationModalController',
            size: 'md',
            resolve: {
              student: function () {
                return student;
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
    * Student notification modal
    */
   NSPraxManager.controller('NotificationModalController', ['$scope', '$modalInstance', '$http', 'student', function ($scope, $modalInstance, $http, student) {
       
       /**
        * Close notification modal
        */
      $scope.close = function () {
          $modalInstance.dismiss('cancel');
      };

      /**
       * Send notification to student
       */
      $scope.send = function () {
        
        $http.post('/notifications/send_student_notification', {
            'StudentFullName': student.FirstName + ' ' + student.LastName,
            'StudentMail': student.Email,
            'Message': $scope.notification.Message
        })
        .success(function () {
          $modalInstance.close();
        });
      }
      
    }]);
}();