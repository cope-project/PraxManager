/**
 * Internships module
 */


!function () {
	/**
	 * Internships controller
	 */
    NSPraxManager.controller('InternshipsController', ['$scope', '$http', '$modal', '$timeout',
		function ($scope, $http, $modal, $timeout) {

			// bootstrapping
			$scope.internships = [];

			$scope.editingMode = false;

			$scope.tableView = true
			$scope.formViewBasic = false
			$scope.formViewAdvance = false

			$scope.tableViewToolbar = true;
			$scope.formViewToolBar = false;
			var defaultInternship = { 'CompletionLimit': 'last3days', 'ColectDataType': 'day' };
			$scope.internship = defaultInternship
			$scope.students = [];
			$scope.forms = [];
			$scope.managers = [];

			var limit = 30;
			var skip = 0;
			var page = 0;


			$scope.selectPage = function (_page) {
				page = _page;
				loadInternships();
			};

			$scope.pageActive = function (_page) {
				if (_page == page) {
					return 'active';
				}
				return '';
			}

			$scope.$watch('internship', function (newValue, oldValue) {
				if (newValue != defaultInternship) {
					NSPraxManager.unsavedChanges = true;
				}
			}, true);

			$scope.$watch('students', function (newValue, oldValue) {
				if (newValue.length > 0) {
					NSPraxManager.unsavedChanges = true;
				}
			}, true);

			$scope.$watch('forms', function (newValue, oldValue) {
				if (newValue.length > 0) {
					NSPraxManager.unsavedChanges = true;
				}
			}, true);

			$scope.$watch('managers', function (newValue, oldValue) {
				if (newValue.length > 0) {
					NSPraxManager.unsavedChanges = true;
				}
			}, true);

			$scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			$scope.startDatePikerOpened = false;
			$scope.endDatePikerOpened = false;

			function loadInternships() {
				$http.get('/api/internships?limit='+ limit + '&skip=' + (page * limit)).success(function (internships, status, headers) {
					$scope.internships = internships;
					var itemsCount = headers()['x-items-count'];
					$scope.pages = pagination(itemsCount, limit);
				});
			}

			loadInternships();

			/**
			 * Open start date, date picker
			 */
			$scope.openStartDateDatepiker = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.startDatePikerOpened = true;
			}


			/**
			 * Open end date, date picker
			 */
			$scope.openEndDateDatepiker = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.endDatePikerOpened = true;
			};

			/**
			 * Add internship 
			 */
			$scope.addInternship = function () {
				$scope.tableView = false
				$scope.tableViewToolbar = false

				$scope.formViewBasic = true
				$scope.formViewToolBar = true;
			};

			/**
			 * Delete internship
			 */
			$scope.deleteInternship = function (internship) {
				if (!confirm($t("Are you sure you want to delete this internship ?"))) {
					return;
				}

				$http.delete('/api/internships/' + internship._id).success(function () {
					loadInternships();
				});

			};

			$scope.archiveInternship = function (internship) {
				if (!confirm($t("Are you sure you want to archive this internship ?"))) {
					return;
				}
				$http.post('/api/internships/' + internship._id + '/archive').success(function () {
					loadInternships();
				});

			};

			/**
			 * Cancel edit internship
			 */
			$scope.cancel = function () {
				$scope.tableView = true
				$scope.formViewBasic = false
				$scope.formViewAdvance = false

				$scope.tableViewToolbar = true;
				$scope.formViewToolBar = false;

				$scope.internship = {};
				$scope.students = [];
				$scope.forms = [];
				$scope.managers = [];
				$timeout(function () {
					NSPraxManager.unsavedChanges = false;
				});
			};

			/**
			 * Go to the next step of editing
			 */
			$scope.next = function () {
				$scope.tableView = false
				$scope.formViewBasic = false
				$scope.formViewAdvance = true

				$scope.tableViewToolbar = false;
				$scope.formViewToolBar = true;
			};

			/**
			 * Add form to internship
			 */
			$scope.addForm = function () {
				var modalInstance = $modal.open({
					templateUrl: 'addFormModal.html',
					controller: 'AddFormModalController',
				});
				modalInstance.result.then(function (form) {
					if (!_inCollection($scope.forms, form)) {
						$scope.forms.push(form)
					}
				}, function () {
				});
			};

			/**
			 * Check collections
			 */
			function _inCollection(collection, object) {
				var exists = false;
				collection.forEach(function (item) {
					if (item._id === object._id && item._id !== undefined) {
						exists = true;
					}
				});

				return exists;
			}
			/**
			 * Add student to internship
			 */
			$scope.addStudent = function () {
				var modalInstance = $modal.open({
					templateUrl: 'addStudentModal.html',
					controller: 'AddStudentModalController',
				});
				modalInstance.result.then(function (students) {
					students.forEach(function (student) {
						if (!_inCollection($scope.students, student)) {
							$scope.students.push(student)
						}
					});
				}, function () {
				});
			}

			/**
			 * Add manager to internship
			 */
			$scope.addInternshipManager = function () {
				var modalInstance = $modal.open({
					templateUrl: 'addManagerModal.html',
					controller: 'AddManagerModalController',
				});
				modalInstance.result.then(function (user) {
					$scope.managers.push(user);
				}, function () {
				});
			}

			/**
			 * Remove student form internship
			 */
			$scope.deleteStudent = function (student, index) {
				if (!confirm("Are you sure you want to remove this student ?")) {
					return;
				}
				$scope.students.splice(index, 1);
			}

			/**
			 * Remove form from internship
			 */
			$scope.deleteForm = function (form, index) {
				if (!confirm($t("Are you sure you want to remove this form ?"))) {
					return;
				}
				$scope.forms.splice(index, 1);
			}

			/**
			 * Remove manager form internship
			 */
			$scope.deleteManager = function (manager, index) {
				if (!confirm($t("Are you sure you want to remove this manager ?"))) {
					return;
				}
				$scope.managers.splice(index, 1);
			};


			/**
			 * Save internship
			 */
			$scope.save = function () {
				$scope.internship.AssignedUsers = $scope.students;
				$scope.internship.AssignedForms = $scope.forms;
				$scope.internship.AssignedAdministrators = $scope.managers;

				$scope.tableView = true
				$scope.formViewBasic = false
				$scope.formViewAdvance = false

				$scope.tableViewToolbar = true;
				$scope.formViewToolBar = false;

				$scope.internship.StartDate = moment($scope.internship.StartDate).format('YYYY-MM-DD');
				$scope.internship.EndDate = moment($scope.internship.EndDate).format('YYYY-MM-DD');

				if ($scope.editingMode) {
					$http.put('/api/internships/' + $scope.internship._id, $scope.internship).success(function () {
						$http.get('/api/internships').success(function (internships) {
							$scope.internships = internships;
							NSPraxManager.unsavedChanges = false;
						})
					});
					$scope.editingMode = false;
				} else {
					$http.post('/api/internships', $scope.internship).success(function () {
						$http.get('/api/internships').success(function (internships) {
							$scope.internships = internships;
							NSPraxManager.unsavedChanges = false;
						})
					});
				}

			}


			/**
			 * Edit internship
			 */
			$scope.editInternship = function (internship) {
				$scope.tableView = false
				$scope.tableViewToolbar = false

				$scope.formViewBasic = true
				$scope.formViewToolBar = true;

				$scope.editingMode = true;
				$scope.students = internship.AssignedUsers;
				$scope.forms = internship.AssignedForms;
				$scope.internship = internship;
				$scope.managers = internship.AssignedAdministrators;
			};

		}]);

    /**
	 * Add student modal controller
	 */
    NSPraxManager.controller('AddStudentModalController', ['$scope', '$http', '$modalInstance', function ($scope, $http, $modalInstance) {

		$scope.users = [];
		$scope.selected = null;
		$scope.tags = [];
		$scope.useTag = false;
		$scope.tag = null;

		$scope.searchText = undefined;

		$scope.hasValue = function (actual, expected) {
			if (!expected) {
				return true;
			}

			return actual.indexOf(expected) !== -1;
		};


		$http.get('/api/users?type=student&limit=0').success(function (users) {
			$scope.users = users;
			var tags = {};

			users.forEach(function (user) {
				if (user.Tag) {
					tags[user.Tag] = true;
				}
			});

			$scope.tags = Object.keys(tags);
		});

		/**
		 * Add student to internship
		 */
		$scope.add = function () {
			if ($scope.useTag && !$scope.tag) {
				return $modalInstance.dismiss('cancel');
			}
			if (!$scope.selected && !$scope.useTag) {
				return $modalInstance.dismiss('cancel');
			}

			if (!$scope.useTag) {
				return $modalInstance.close([$scope.selected]);
			}

			if ($scope.useTag) {
				var selected_users = [];
				$scope.users.forEach(function (user) {
					if (user.Tag === $scope.tag) {
						selected_users.push(user);
					}
				});

				return $modalInstance.close(selected_users);
			}

		};

		/**
		 * Close modal
		 */
		$scope.close = function () {
			$modalInstance.dismiss('cancel');
		};
    }]);

	/**
	 * Add manager modal controller
	 */
	NSPraxManager.controller('AddManagerModalController', ['$scope', '$http', '$modalInstance', function ($scope, $http, $modalInstance) {
		$scope.users = [];
		$scope.selected = null;


		$http.get('/api/users?type=teacher&limit=0').success(function (users) {
			$scope.users = users
		});

		/**
		 * Add manager to internship
		 */
		$scope.add = function () {
			if (!$scope.selected) {
				$modalInstance.dismiss('cancel');
			}

			$modalInstance.close($scope.selected);
		};

		/**
		 * Close modal
		 */
		$scope.close = function () {
			$modalInstance.dismiss('cancel');
		};
    }]);

	/**
	 * Add form modal controller
	 */
    NSPraxManager.controller('AddFormModalController', ['$scope', '$http', '$modalInstance', function ($scope, $http, $modalInstance) {
		$scope.forms = [];
		$scope.selected = null;


		$http.get('/api/forms').success(function (forms) {
			$scope.forms = forms
		});

		/**
		 * Add form to internship
		 */
		$scope.add = function () {
			if (!$scope.selected) {
				$modalInstance.dismiss('cancel');
			}
			$modalInstance.close($scope.selected);
		};

		/**
		 * Close modal
		 */
		$scope.close = function () {
			$modalInstance.dismiss('cancel');
		};

    }]);
} (); 