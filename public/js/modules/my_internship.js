/**
 * My Internship module
 */
!function () {
    /**
	 * Student internship controller
	 */
    NSPraxManager.controller('MyInternshipController', ['$scope', '$http', '$modal', 'uiCalendarConfig', function ($scope, $http, $modal, uiCalendarConfig) {
		
	$scope.internship = {};
	$scope.checkins = [];

	$scope.hasInternshipEnded = true;
	
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
	
	$scope.calendar = {events: []};
	var calendar_options = {
		 	events : [/*{start: '2015-08-24', end: '2015-08-25', rendering: 'background',backgroundColor: 'green'},*/],
		 	height: 450,
		        editable: true,
		        firstDay: 1,
		        timezone: 'UTC',
		        header:{
		          left: 'title',
		          center: '',
		          right: 'prev,next'
		        },
		        
		        dayClick: function (date, jsEvent, view){
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
			        	    element.html('<span class="label label-info hidden-xs">'+$t('Current Day')+'</span><span class="label label-info hidden-sm hidden-md hidden-lg">CD</span>');
			        	}else{
				            var cellIsBefore = cell.start.utc().isBefore(moment($scope.internship.StartDate).utc());
				            var cellIsAfter =  cell.start.utc().isAfter(moment($scope.internship.EndDate).utc());
				            if(!cellIsBefore && !cellIsAfter){
				            	renderCellContent(cell.start, element);
				            }
			        	    
			        	}
		            }
		            
		            loadForms(function () {
		            	$scope.checkCheckedIn();
		            });
		            
		        },
		        
		        dayRender: function (date, cell){
		            var isBefore = date.utc().isBefore(moment($scope.internship.StartDate).utc());
		            var isAfter =  date.utc().isAfter(moment($scope.internship.EndDate).utc());
		            
		            if(isBefore || isAfter){
		        		cell.css({'background-image': 'url("/images/line_pattern.jpg")'});
		        		return;
		            }
		            
		            if(date.utc().format() == $scope.today.format()){
			        	cell.css({'background': '#fcf8e3'})
			        	cell.html('<span class="label label-info hidden-xs">'+$t('Current Day')+'</span><span class="label label-info hidden-sm hidden-md hidden-lg">CD</span>');
			        	return;
		            }
		            renderCellContent(date, cell);
		        }
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

	 /**
	  * Load checkins
	  */
	function loadCheckins(loaded){
		$http.get('/api/checkin/my_checkins?internshipId='+PraxManager_internshipId)
		.success(function (data) {
			$scope.checkins = data;
			if(loaded){
				loaded();
			}
		});
	}

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
	 * Load student internship
	 */
	function loadInternship( internship_loaded ){
		var url = '/api/internships/' + PraxManager_internshipId;
	    
	    $http.get(url).success(function (data, status, headers, config){
			$scope.internship = data;

	    	var isBefore = $scope.today.isBefore(moment($scope.internship.StartDate).utc());
	    	var isAfter =  $scope.today.isAfter(moment($scope.internship.EndDate).utc());
	        
	    	if(isBefore || isAfter){
	        	$scope.today = moment($scope.internship.StartDate).utc().startOf('day');
	        	$scope.checkCheckedIn();
	    	}
		
			if(moment().utc().isAfter(moment(data.EndDate).utc())){
		    	$scope.hasInternshipEnded = true;
			}else{
		    	$scope.hasInternshipEnded = false;
			}

			loadForms(function () {
				$scope.checkCheckedIn();
			});

			if(internship_loaded) {
				internship_loaded();
			}
		});
	}
	
	/**
	 * Load internship forms
	 */
	function loadForms(daily_forms_loaded) {
	    $scope.generalForms = [];
	    $scope.dailyForms = [];
		
		for(var index in $scope.internship.AssignedForms){
		    var form = $scope.internship.AssignedForms[index];
		    
		    if(form.Interval == "once"){
				$scope.loadGeneralForm(form, daily_forms_loaded);
		    }
		
		    if(form.Interval == "daily"){
				$scope.loadDailyForm(form, daily_forms_loaded);
		    }
		}
	}
	
	/**
	 * Load internship general forms
	 */
	$scope.loadGeneralForm = function (form, general_forms_loaded) {
	    var form_data = angular.copy(form);
	    var url = '/api/forms_data/exists_general?formTemplateId='+form_data._id+'&internshipId=' + PraxManager_internshipId;
	    $http.get(url).success(function (data) {
		
		var newForms = angular.copy($scope.generalForms);
			
		if(data.exists){
		    data.form.FormData.readOnly = true;
		    // the form is editable for 1h
		    var isStudentEditable = moment(data.form.CreateDate).utc().isBefore(moment().utc().subtract(1, 'hours'));
		    
		    if(isStudentEditable){
				data.form.FormData.canEdit = false;
		    }else{
				data.form.FormData.canEdit = true;
		    }
		    
		    // set id for save
		    data.form.FormData._existingId = data.form._id;
		    $scope.generalForms.push(data.form.FormData);
			if(general_forms_loaded){
				general_forms_loaded();
			}
		}else{
			$http.get('/api/forms/' + form_data._id).success(function (updated_form){
				$scope.generalForms.push(updated_form);
				if(general_forms_loaded){
					general_forms_loaded();
				}
			});
		    
		}
	});
    };
	
	/**
	 * Load internship general forms
	 */
	$scope.loadDailyForm = function (form, daily_forms_loaded) {
		
	    var form_data = angular.copy(form);
	    var url = '/api/forms_data/exists_daily?formTemplateId='+form_data._id+'&internshipId=' 
	    url += PraxManager_internshipId+'&date=' + $scope.today.utc()
	    
		$http.get(url).success(function (data) {
			if(data.exists){
			    data.form.FormData.readOnly = true;

			    var isStudentEditable = moment(data.form.CreateDate).utc().isBefore(moment().utc().subtract(1, 'hours'));

			    if(isStudentEditable){
					data.form.FormData.canEdit = false;
			    }else{
					data.form.FormData.canEdit = true;
			    }
			    
			    data.form.FormData._existingId = data.form._id;
			    $scope.dailyForms.push(data.form.FormData);
				if(daily_forms_loaded){
					daily_forms_loaded();
				}
			}else{
				$http.get('/api/forms/' + form_data._id).success(function (updated_form){
					$scope.dailyForms.push(updated_form);
					if(daily_forms_loaded){
						daily_forms_loaded();
					}
				});
				

			}
		});
	    
	} 
	

	/**
	 * Returns template id for question type
	 */
	$scope.getTemplateUrl = function (question) {
	    return 'questionControl'+question.Type+'.html'; 
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
	    	loadCheckins(function () {
	    		$scope.checkCheckedIn();
	    	});
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
			loadForms(function () {
				$scope.checkCheckedIn();
			});
	    }, function () {
	      // no result
	    });
	}
	
	// load data
	loadInternship(function () {
		loadCheckins(function () {
			$scope.checkCheckedIn();
			$scope.calendar = calendar_options;
		});
	});


    }]);
    
	/**
	 * Question controller
	 */
    NSPraxManager.controller('QuestionController', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
	
	$scope.error = false;
	$scope.file = $scope.question.Value;
	$scope.isFileUploaded = false;
	
	/**
	 * Upload file form
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
	
	/**
	 * Upload video form
	 */
	$scope.uploadVideo = function (e) {
	    e.preventDefault();
	    var form = angular.element(e.target);
	    uploadForm(form);
	};
	
	/**
	 * Upload audio form
	 */
	$scope.uploadAudio = function (e) {
	    e.preventDefault();
	    var form = angular.element(e.target);
	    uploadForm(form);
	};
	
	/**
	 * Upload photo form
	 */
	$scope.uploadPhoto = function (e) {
	    e.preventDefault();
	    var form = angular.element(e.target);
	    uploadForm(form);
	};
	
	/**
	 * Upload document form
	 */
	$scope.uploadDocument = function (e) {
	    e.preventDefault();
	    var form = angular.element(e.target);
	    uploadForm(form);
	};
	
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
	$scope.uploadAudio = function (e){
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