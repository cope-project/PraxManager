/**
 * My Internship module
 */
!function () {
	
	var defaultIntervals = [		
	{text: $t('Sunday'), value: 0},
	{text: $t('Monday'), value: 1},
	{text: $t('Tuesday'), value: 2},
	{text: $t('Wednesday'), value: 3},
	{text: $t('Thursday'), value: 4},
	{text: $t('Friday'), value: 5},
	{text: $t('Saturday'), value: 6}];
	
	/**
	 * Fetch internship data service
	 */
	NSPraxManager.factory('StudentInternshipService', ['$http', '$q', function ($http, $q) {
		/**
		 * Fetch standalone form
		 */
		function loadStandAloneForm(internshipId, formId) {
			var deferred = $q.defer();
			var url = '/api/forms_data/exists_general?formTemplateId='+formId+'&internshipId=' + internshipId;
			$http.get(url).success(function (data) {
				if(data.exists){
					var oneHour = moment().utc().subtract(1, 'hours');
					data.form.FormData._existingId = data.form._id;
					
					if(!data.form.FormData.Intervals){
						data.form.FormData.Intervals = defaultIntervals;
					}
					
					var standAloneForm = !!data.form.FormData.Intervals.find(function (interval) {
						return interval.value === 'Once';
					});
					
					var isStudentEditable = moment(data.form.CreateDate).utc().isBefore(oneHour);
					if(!standAloneForm){
						if(isStudentEditable){
							data.form.FormData.canEdit = false;
						}else{
							data.form.FormData.canEdit = true;
						}
					}else{
						data.form.FormData.canEdit = true;
					}
					deferred.resolve(data.form.FormData);
				}else{
					$http.get('/api/forms/' + formId).success(function (data){
						deferred.resolve(data);
					}).error(function (error) {
						deferred.reject(error);
					});
				}
			}).error(function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}
		
		function loadFormForADay(internshipId, formId, day) {
			var deferred = $q.defer();
			var url = '/api/forms_data/exists_daily?formTemplateId='+formId+'&internshipId=' 
	    	url += internshipId+'&date=' + day.format('YYYY-MM-DD');
			$http.get(url).success(function (data) {
				if(data.exists){
					var oneHour = moment().utc().subtract(1, 'hours');
					var isStudentEditable = moment(data.form.CreateDate).utc().isBefore(oneHour);
					data.form.FormData._existingId = data.form._id;
					
					if(isStudentEditable){
						data.form.FormData.canEdit = false;
					}else{
						data.form.FormData.canEdit = true;
					}
					deferred.resolve(data.form.FormData);
				}else{
					$http.get('/api/forms/' + formId).success(function (data){
						deferred.resolve(data);
					}).error(function (error) {
						deferred.reject(error);
					});
				}
			}).error(function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		}
		
		return {
			loadCheckins: function (internshipId) {
				var deferred = $q.defer();
				$http.get('/api/checkin/my_checkins?internshipId='+internshipId)
				.success(function (data) {deferred.resolve(data);})
				.error(function (error) {deferred.reject(error);});
				return deferred.promise;
			},
			
			loadInternship: function (internshipId, day) {
				var deferred = $q.defer();
				var url = '/api/internships/' + internshipId;
				$http.get(url).success(function (internship) {
					var forms = [];
					internship.AssignedForms.forEach(function (form) {
						
						if(!form.Intervals){ form.Intervals = defaultIntervals;}
						
						var standAloneForm = !!form.Intervals.find(function (interval) {
							return interval.value === 'Once';
						});
						
						if(standAloneForm){
							forms.push(loadStandAloneForm(internshipId, form._id));
						}else {
							var hasFormForDay = !!form.Intervals.find(function (interval) {
								return interval.value == day.day();
							});
							if(hasFormForDay){
								forms.push(loadFormForADay(internshipId, form._id, day));
							}
						}
					});
					$q.all(forms).then(function (forms) {
						deferred.resolve({internship: internship, forms: forms});
					}, function (error) {
						deferred.reject(error);
					})
				}).error(function (error) {
					deferred.reject(error);
				});
				return deferred.promise;
			}
 		};
	}]);
	
    /**
	 * Student internship controller
	 */
    NSPraxManager.controller('MyInternshipController', ['$scope', '$http', '$modal', 'uiCalendarConfig', 'StudentInternshipService', '$q',
	function ($scope, $http, $modal, uiCalendarConfig, StudentInternshipService, $q) {
		
	$scope.internship = {};
	$scope.checkins = [];
	
	$scope.today = moment().utc().startOf('day');
	$scope.generalForms = [];
	$scope.dailyForms = [];
	
	$scope.checkinWidget = {
		label: $t('Checkin Current Day'),
		enabled: false,
		icon:'fa-check-circle-o'
	};
	
	$scope.formWarning = false;
	$scope.currentCheckin = null;
	
	/**
	 * Calendar day click handler
	 */
	function dayClickHandler(date, jsEvent, view){
		var isBefore = date.isBefore(moment($scope.internship.StartDate).utc());
		var isAfter =  date.isAfter(moment($scope.internship.EndDate).utc());
		
		if(isBefore || isAfter){
			return;
		}
		            
		$scope.today = date;
		var cellCnt = view.dayGrid.rowCnt * view.dayGrid.colCnt;
		            
		for (var i = 0; i < cellCnt; i++) {
			var cell = view.dayGrid.getCell(i);
			var element = view.dayGrid.dayEls.eq(i);
			
			if(date.isSame(cell.start)){
				element.css({'background': '#fcf8e3'})
				var html = '<span class="label label-info hidden-xs">';
				html += $t('Current Day')+'</span><span class="label label-info hidden-sm hidden-md hidden-lg">CD</span>'
				element.html(html);
			}else{
				var cellIsBefore = cell.start.utc().isBefore(moment($scope.internship.StartDate).utc());
				var cellIsAfter =  cell.start.utc().isAfter(moment($scope.internship.EndDate).utc());
				if(!cellIsBefore && !cellIsAfter){
					renderCellContent(cell.start, element);
				}
				
			}
		}
		
		load($scope, PraxManager_internshipId, $scope.today)
	};
	
	/**
	  * Render calendar cell with data from backend
	  */
	function renderCellContent(date, cell){
		var noCheckinFound = true;
		$scope.checkins.forEach(function (checkin, index) {
			if(date.utc().format() == moment(checkin.Date).utc().format()){
				noCheckinFound = false;
		        if(checkin.Status == 'pending'){
		           	cell.css({'background': '#d9edf7'});
		            cell.html('<span class="label label-info hidden-xs">'+$t('Pending')+'</span><span class="label label-info hidden-sm hidden-md hidden-lg">P</span>');
		        }

		        if(checkin.Status == 'approved'){
		            cell.css({'background': '#dff0d8'});
		            	cell.html('<span class="label label-success hidden-xs">'+$t('Approved')+'</span><span class="label label-success hidden-sm hidden-md hidden-lg">A</span>');
		            }

		        if(checkin.Status == 'rejected'){
		            cell.css({'background': '#fcf8e3'});
		            cell.html('<span class="label label-danger hidden-xs">'+$t('Rejected')+'</span><span class="label label-danger hidden-sm hidden-md hidden-lg">R</span>');
		        }
		    }
		});

		if(noCheckinFound){
			cell.css({'background': 'none'});
			cell.text('');
		}
	 }
				
	$scope.calendar = {events: []};
	
	var calendar_options = {
		 	events : [],
		 	height: 450,
		        editable: true,
		        firstDay: 1,
		        timezone: 'UTC',
		        header:{
		          left: 'title',
		          center: '',
		          right: 'prev,next'
		        },
		        dayClick: dayClickHandler,
		        
		        dayRender: function (date, cell){
		            var isBefore = date.utc().isBefore(moment($scope.internship.StartDate).utc());
		            var isAfter =  date.utc().isAfter(moment($scope.internship.EndDate).utc());
		            
		            if(isBefore || isAfter){
		        		cell.css({'background-image': 'url("/images/line_pattern.jpg")'});
		        		return;
		            }
		            
		            if(date.utc().format() == $scope.today.utc().format()){
			        	cell.css({'background': '#fcf8e3'})
						var html = '<span class="label label-info hidden-xs">'+$t('Current Day');
						html += '</span><span class="label label-info hidden-sm hidden-md hidden-lg">CD</span>';
			        	cell.html(html);
			        	return;
		            }
		            renderCellContent(date, cell);
		        }
	 };	

	 /**
	  * Loads the internship into the ui
	  */
	 function load($scope, internshipId, date) {
		 var checkinsPromise = StudentInternshipService.loadCheckins(internshipId);
		 var internshipPromise = StudentInternshipService.loadInternship(internshipId, date);
		 
		 $q.all([checkinsPromise, internshipPromise]).then(function (promises) {
			 
			 var internship = promises[1].internship;
			 $scope.checkins = promises[0];
			 $scope.internship = internship ;
			 $scope.calendar = calendar_options;
			 
			 var isBefore = date.isBefore(moment(internship.StartDate).utc());
	    	 var isAfter =  date.isAfter(moment(internship.EndDate).utc());
	        
	    	 if(isBefore || isAfter){
	        	$scope.today = moment(internship.StartDate).utc().startOf('day');
				return load($scope, internshipId, $scope.today);
	    	 }
			
			onFormsLoaded(promises[1]);
			$scope.checkCheckedIn();
		 });
	 }
	 
	 /**
	  * Callback handler, loads the forms into the ui
	  */
	 function onFormsLoaded(data) {
		 
		 $scope.generalForms = [];
		 $scope.dailyForms = [];
		 
		 return data.forms.forEach(function (form) {
			if(!form.Intervals){ form.Intervals = defaultIntervals;}
			
			var standAloneForm = !!form.Intervals.find(function (interval) {
				return interval.value === 'Once';
			});
			
			if(standAloneForm){
				$scope.generalForms.push(form);
			}else{
				$scope.dailyForms.push(form);
			}
		});
	 }
	 
	 load($scope, PraxManager_internshipId, $scope.today);


	/**
	 * Update the state of the checkin button
	 */
	$scope.checkCheckedIn = function () {
		// check if any forms need to be completed
		var formsCompleted = true;

		// are forms completed
		$scope.dailyForms.forEach(function (form, index) {
			if(form.Type == 'required' && form._existingId == undefined){
				formsCompleted = false;
			}
		});

		if(!formsCompleted){
			$scope.checkinWidget.label = $t('Checkin Current Day');
			$scope.checkinWidget.enabled = false;
			$scope.formWarning = true;
			return;
		}

		$scope.formWarning = false;
		// check if a checkin exists for the current day
		var isTodayChecked = false;

		$scope.checkins.forEach(function (checkin, index) {
			if(moment(checkin.Date).utc().format() == $scope.today.utc().format()){
				$scope.currentCheckin = checkin;
				isTodayChecked = true;
			}
		});


		if(isTodayChecked){
			if($scope.currentCheckin.Status === 'pending'){
				$scope.checkinWidget.enabled = true;
				$scope.checkinWidget.label = $t('Edit Checkin');
			}else{
				$scope.checkinWidget.enabled = false;
				$scope.checkinWidget.label = $t('Checked in');
			}

		}else{
			$scope.checkinWidget.label = $t('Checkin Current Day');
			$scope.checkinWidget.enabled = true;
			$scope.currentCheckin = null;
		}
	};
	
	
	/**
	 * Student checkin action
	 */
	$scope.checkin = function () {
	    var modalInstance = $modal.open({
		templateUrl: 'checkinModal.html',
		controller: 'CheckinModalController',
		resolve: {
			
		    day: function () {
				return $scope.today;
		    },
		    internship: function () {
				return $scope.internship;
		    },
			
			currentCheckin : function () {
				// if null create else update
				return $scope.currentCheckin;
			} 
		 }
	    });
	    
	    modalInstance.result.then(function () {
			load($scope, PraxManager_internshipId, $scope.today);
	    }, function () {
		      console.log('Modal dismissed at: ' + new Date());
		});
	};	

	/**
	 * Student submit form
	 */
	$scope.submitForm = function (form, mode){
		
		var modalInstance = $modal.open({
			templateUrl: 'submitForm.html',
			controller: 'FormModalController',
			size: 'lg',
			resolve: {
		    	form: function () {
			    	return form;
		    	},
		    	today: function () {
		    		return $scope.today;
		    	},
		    	mode : function () {
		    		return mode;
		    	}
		 	}
	    });
	    
	    modalInstance.result.then(function (question) {
			load($scope, PraxManager_internshipId, $scope.today);
	    }, function () {
	      // no result
	    });
	}
	
    }]);
    
    
	/**
	 * Form modal controller
	 */
    NSPraxManager.controller('FormModalController', ['$scope', '$modalInstance', '$http', 'form', 'today', 'mode',
    	function ($scope, $modalInstance, $http, form, today, mode) {
		$scope.form = angular.copy(form);

		if(mode == 'new'){
			$scope.form.readOnly = false;
		}

		if(mode == 'edit'){
			$scope.form.readOnly = false;
		}

		if(mode == 'preview'){
			$scope.form.readOnly = true;
		}

		/**
		 * Close modal
		 */
		$scope.close = function () {
		    $modalInstance.dismiss('cancel');
		};
		
		/**
		 * Return template id for question type
		 */
		$scope.getTemplateUrl = function (question) {
		    return 'questionControl'+question.Type+'.html'; 
		};

		/**
		 * Validate form
		 */
		$scope.isValid = function (form) {
			var isFormaValid = true;
			$scope.form.Questions.forEach(function (subject, index) {
				subject.Questions.forEach(function (question, index) {
					if(question.Value == undefined){
			    		isFormaValid = false;
					}
				});
			});

			return isFormaValid;
		};

		/**
		 * Save form
		 */
		$scope.saveForm = function (form){
	    	var data = {
		    	'FormTemplateId': form._id,
		    	'InternshipId': PraxManager_internshipId,
		    	'FormData': form,
		    	'Date': today,
		    	'CompletedBy': 'student',

	    	};
	    
		    if(form._existingId){
				$http.put('/api/forms_data/' + form._existingId, {'FormData': form}).success(function (data) {
					$modalInstance.close(form);
				}).error(function () {});
		    }else{
			    $http.post('/api/forms_data', data).success(function (data) {
					$modalInstance.close(form);
			    }).error(function () {
				
			    });
		    }
		};


    }]);
    
	/**
	 * Checkin modal controller
	 */
    NSPraxManager.controller('CheckinModalController', ['$scope', '$http','$modalInstance', 'day', 'internship', 'currentCheckin',
    	function ($scope, $http, $modalInstance, day, internship, currentCheckin){
	$scope.day = day;
	$scope.error = false;
	$scope.isAppleIOS = /iPad|iPhone|iPod/.test(navigator.platform);

	$scope.checkin = currentCheckin || {
		'Date': day,
		'Type': internship.Type,
		'Time': 1,
	};
	
	$scope.file = $scope.checkin.MediaFileComment;
	
	$scope.internship = internship;
	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	/**
	 * Perform checkin
	 */
	$scope.doCheckin = function () {
		$scope.checkin.MediaFileComment = $scope.file;
		if(currentCheckin !== null) {
			$http.put('/api/checkin/' + currentCheckin._id,  $scope.checkin)
			.success(function (data) {
				$modalInstance.close(data);
			}).error(function () {
				$scope.error = true;
			});
		}else{
			$http.post('/api/checkin/' + PraxManager_internshipId,  $scope.checkin)
			.success(function (data) {
				$modalInstance.close(data);
			}).error(function () {
				$scope.error = true;
			});
		}

	};

	/**
	 * Upload audio file
	 */
	$scope.uploadFile = function (e){
	    e.preventDefault();
	    var form = angular.element(e.target);
		$scope.uploading = true;
	    uploadForm(form);
	}

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
		    
		    $scope.error = $t('File upload error.');
		    
	        })}, success: function(response) {
	            $scope.$apply(function($scope) {
					$scope.uploading = false;
	        		$scope.file = response;
	        		$scope.isFileUploaded  = true;
	        		$scope.checkin.MediaFileComment = response;
	        		$scope.error = false;
	            });
	        }
	    });
	}

    }]);
}();