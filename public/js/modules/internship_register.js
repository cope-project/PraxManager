/**
 * Internship register module
 */

!function() {
    /**
     * Internshp students controller
     */
    NSPraxManager.controller('InternshipRegisterController', ['$scope', '$http', '$modal', '$q',function($scope, $http, $modal, $q) {
        $scope.internship = {};
        $scope.checkins = [];
        $scope.users = [];

        $http.get('/api/internships/' + PraxManager_internshipId)
        .success(function(internship) {
            $scope.internship = internship;
        });
        
        $http.get('/api/users?limit=0').success(function (users) {
            $scope.users = users;
            fetch();
        });

        $scope.date = moment().format('YYYY-MM-DD');

        function fetch() {
            var date = moment($scope.date).format('YYYY-MM-DD');
            $http.get('/api/checkin/query_by_date?date=' + 
            date + '&internshipId=' + PraxManager_internshipId).success(function(checkins) {
                $scope.checkins = checkins.map(function (checkin) {
                    checkin.Approve = (checkin.Status === 'approved');
                    checkin.user = $scope.users.filter(function (user) {
                        return user._id === checkin.UserId;
                    })[0];
                    return checkin;
                }).filter(function (checkin) {
                    return !!checkin.user;
                });
                
            });
        }

        $scope.onApprove = function (_checkin) {
            var checkin = angular.copy(_checkin);
            if(checkin.Approve){
                checkin.Status = 'approved';
            }else{
                checkin.Status = 'rejected';
            }
            
            delete checkin['Approve'];
            delete checkin['user'];
            
            return $http.put('/api/checkin/' + checkin._id, checkin);
        };

        $scope.dateOptions = {
            dateDisabled: false,
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };

        $scope.isDatepickerOpen = false;

        $scope.openPicker = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.isDatepickerOpen = true;
        };


        $scope.onDateChange = function() {
            fetch();
        };

        $scope.approveAll = function () {
            var items = [];
            $scope.checkins.forEach(function (checkin) {
                checkin.Approve = true;
                var item = $scope.onApprove(checkin);
                items.push(item);
            });

            $q.all(items).then(function () {
                fetch();
            }, function () {
                fetch();
            });
        };

    }]);
} ();