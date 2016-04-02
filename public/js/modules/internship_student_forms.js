/**
 * Internship student forms module
 */


!function () {
    /**
     * Internship students forms
     */
    NSPraxManager.controller('InternshipStudentFormsController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
        $scope.internship = {};
        $scope.student = {};
        $scope.readOnly = true;
        $scope.forms = []

        $http.get('/api/internships/' + PraxManager_internshipId).success(function (internship) {
            $scope.internship = internship;
        })

        $http.get('/api/users/' + PraxManager_studentId).success(function (student) {
            $scope.student = student;
        })

        var forms_query = '/api/forms_data/query?userId=' + PraxManager_studentId + '&internshipId=' + PraxManager_internshipId;

        $http.get(forms_query).success(function (forms) {

            var forms_data = [];

            forms.forEach(function (form, index) {
                var form_group = null;
                forms_data.forEach(function (group, index) {
                    if (group._id == form.FormData._id) {
                        form_group = group;
                    }
                })

                if (form_group === null) {
                    forms_data.push({ _id: form.FormData._id, Name: form.FormData.Name, Forms: [form], templateId: form.FormTemplateId})
                } else {
                    form_group.Forms.push(form);
                }
            });

            $scope.forms = forms_data;
        });
       
        /**
         * Review Form
         */
        $scope.reviewForm = function (form) {
            var modalInstance = $modal.open({
                templateUrl: 'formEdit.html',
                controller: 'FormModalController',
                size: 'lg',
                resolve: {
                    formData: function () {
                        return form.FormData;
                    }
                }
            });

            modalInstance.result.then(function (submited_form) {
                $http.put('/api/forms_data/' + form._id, { 'FormData': submited_form }).success(function (data) {
                    form.FormData = submited_form;
                }).error(function () { });
            }, function () {
                // no result
            });
        };


    }]);

    /**
     * Question controller
     */
    NSPraxManager.controller('QuestionController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {

        $scope.error = false;
        $scope.file = $scope.question.Value;
        $scope.isFileUploaded = false;

    }]);
    
    
    /**
     * Form modal controller
     */
    NSPraxManager.controller('FormModalController', ['$scope', '$modalInstance', '$http', 'formData',
        function ($scope, $modalInstance, $http, formData) {
            $scope.form = formData;
            
            $scope.teacherReview = false;
            /**
             * Close form modal
             */
            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            };
		
            /**
             * Returns template id from question / task type
             */
            $scope.getTemplateUrl = function (question) {
                return 'questionControl' + question.Type + '.html';
            };

            /**
            * Check if the form is filled in
            */
            $scope.isValid = function (form) {
                var isFormaValid = true;
                $scope.form.Questions.forEach(function (subject, index) {
                    subject.Questions.forEach(function (question, index) {
                        if (question.Value == undefined) {
                            isFormaValid = false;
                        }
                    });
                });

                return isFormaValid;
            };

            /**
             * Save form
             */
            $scope.saveForm = function (form) {
                $modalInstance.close($scope.form);
            };


        }]);


} ()