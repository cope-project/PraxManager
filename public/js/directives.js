/**
 * Questions directive
 */

!function () {
    NSPraxManager.directive('questionNg', [function () {
        return {
            restrict: 'E',
            scope: {
                position: '=position',
                question: '=question',
                studentReadOnly: '=studentReadOnly',
                teacherReadOnly: '=teacherReadOnly',
                showTeacherReview: '=showTeacherReview',
                type: '=type'
            },
            template: '<div ng-include="getQuestionTemplate()"></div>',
            controller: ['$scope', function ($scope) {
                $scope.position++; // increase zero based position
                $scope.getQuestionTemplate = function () {
                    return 'questionControl' + $scope.type + '.html';
                };
                
                $scope.questionId = uniqueId('question');
                
                function uniqueId(prefix) {
                    var seed = Math.round(Math.random() * 10000000000);
                    return prefix + seed.toString(16);
                }
                
                /**
                 * Upload video file
                 */
                $scope.uploadVideo = function (e) {
                    e.preventDefault();
                    var form = angular.element(e.target);
                    uploadForm(form);
                };
                
                /**
                 * Upload audio file 
                 */
                $scope.uploadAudio = function (e) {
                    e.preventDefault();
                    var form = angular.element(e.target);
                    uploadForm(form);
                };
                
                /**
                 * Upload photo
                 */
                $scope.uploadPhoto = function (e) {
                    e.preventDefault();
                    var form = angular.element(e.target);
                    uploadForm(form);
                };
                
                /**
                 * Upload document
                 */
                $scope.uploadDocument = function (e) {
                    e.preventDefault();
                    var form = angular.element(e.target);
                    uploadForm(form);
                };
	
                
                /**
                 * Upload form with file
                 */
                function uploadForm (form) {
                    $(form).ajaxSubmit({error: function(xhr) {
                    $scope.$apply(function() {
                        if(xhr.responseJSON){
                        $scope.error = xhr.responseJSON.Message;
                        return;
                        }
                        
                        $scope.error = 'File upload error.'
                        
                        })}, success: function(response) {
                            $scope.$apply(function() {
                            $scope.file = response;
                            $scope.isFileUploaded  = true;
                            $scope.question.Value = response;
                            $scope.error = false;
                            });
                        }
                    });
                }
                
                
                
            }]
        };
    }]);
} ();