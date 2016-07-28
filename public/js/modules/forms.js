/**
 * Forms Module
 */

!function () {
	/**
	 * Forms controller
	 */
    NSPraxManager.controller('FormsController', ['$scope', '$http', '$modal', '$timeout', '$q',
		function ($scope, $http, $modal, $timeout, $q) {
			var defaultForm = { Category: 'general', 'Questions': [], 'CompletedBy': 'student', Intervals: [] };
			$scope.forms = []
			$scope.form = defaultForm;
			$scope.categories = PraxManager_Categories;
			$scope.questions = [];
			$scope.plugins = PraxManager_plugins;

			$scope.$watch('form', function (newValue, oldValue) {
				if (newValue != defaultForm) {
					NSPraxManager.unsavedChanges = true;
				}
			}, true);

			$scope.$watch('questions', function (newValue, oldValue) {
				if (newValue.length > 0) {
					NSPraxManager.unsavedChanges = true;
				}
			}, true);

			$scope.editingModel = false;


			var limit = 30;
			var skip = 0;
			var page = 0;


			$scope.selectPage = function (_page) {
				page = _page;
				loadForms();
			};

			$scope.pageActive = function (_page) {
				if (_page == page) {
					return 'active';
				}
				return '';
			}

			function loadForms() {
				$http.get('/api/forms').success(function (forms, status, headers) {
					$scope.forms = forms;
					var itemsCount = headers()['x-items-count'];
					$scope.pages = pagination(itemsCount, limit);
				});
			}

			loadForms();

			$scope.tableViewToolBar = true
			$scope.editFormToolBar = false
			$scope.tableView = true
			$scope.editFormView = false

			var intervals = [
				{ text: $t('Sunday'), value: 0 },
				{ text: $t('Monday'), value: 1 },
				{ text: $t('Tuesday'), value: 2 },
				{ text: $t('Wednesday'), value: 3 },
				{ text: $t('Thursday'), value: 4 },
				{ text: $t('Friday'), value: 5 },
				{ text: $t('Saturday'), value: 6 },
				{ text: $t('Once'), value: 'Once' },
			];

			$scope.loadIntervals = function (query) {
				var deferred = $q.defer();
				deferred.resolve(intervals);
				return deferred.promise;
			};

			$scope.canAdTag = function (tag) {
				var standAloneForm = !!$scope.form.Intervals.find(function (interval) {
					return interval.value == 'Once';
				});
				if (standAloneForm) {
					return false;
				}

				if (tag.value === 'Once' && $scope.form.Intervals.length > 0) {
					return false;
				}
				return true;
			};

			/**
			 * Edit form
			 */
			$scope.editForm = function (form) {
				$scope.questions = form.Questions;
				$scope.form = form;
				$scope.tableViewToolBar = false;
				$scope.editFormToolBar = true;
				$scope.tableView = false;
				$scope.editFormView = true;
				$scope.editingModel = true;
			};

			/**
			 * Add form
			 */
			$scope.addForm = function () {
				var default_subject = { Name: 'General', Questions: [], 'Description': '' };
				$scope.form = {
					Category: 'general', 'Questions': [default_subject],
					'CompletedBy': 'student', 'Type': 'optional',
					Intervals: []
				};
				//$scope.questions = [default_subject];

				$scope.tableViewToolBar = false;
				$scope.editFormToolBar = true;
				$scope.tableView = false;
				$scope.editFormView = true;
			}

			/**
			 * Duplicate form
			 */
			$scope.duplicateForm = function (form) {
				var _form = angular.copy(form);
				delete _form._id;
				_form.Name = _form.Name + ' (Copy 1) ';
				$scope.questions = _form.Questions;

				$scope.form = _form;
				$scope.tableViewToolBar = false;
				$scope.editFormToolBar = true;
				$scope.tableView = false;
				$scope.editFormView = true;
			}

			/**
			 * Add subject
			 */
			$scope.addSubject = function () {
				var modalInstance = $modal.open({
					templateUrl: 'newSubject.html',
					controller: 'NewSubjectModalController',
					size: 'md',
					resolve: {
						subject: function () {
							return { 'subject': { Name: '', 'Questions': [], 'Description': '' }, 'index': null }; // ;
						}
					}
				});

				modalInstance.result.then(function (subject) {
					$scope.form.Questions.push(subject.subject);
				}, function () {
					// no result
				});
			};

			/**
			 * Delete form
			 */
			$scope.deleteForm = function (form) {
				if (!confirm($t("Are you sure you want to delete this form ?"))) {
					return;
				}
				$http['delete']('/api/forms/' + form._id)
					.success(function () {
						loadForms();
					});
			};

			/**
			 * Cancel editing
			 */
			$scope.cancel = function () {
				$scope.tableViewToolBar = true;
				$scope.editFormToolBar = false;
				$scope.tableView = true;
				$scope.editFormView = false;
				$timeout(function () {
					NSPraxManager.unsavedChanges = false;
				});
			};

			/**
			 * Save form
			 */
			$scope.save = function () {
				var form = $scope.form;

				var questionsCount = 0;

				form.Questions.forEach(function (subject, index) {
					questionsCount += subject.Questions.length;
				});

				form.QuestionsCount = questionsCount;

				$scope.tableViewToolBar = true
				$scope.editFormToolBar = false
				$scope.tableView = true
				$scope.editFormView = false


				if ($scope.editingModel) {
					$http.put('/api/forms/' + form._id, form).success(function () {
						loadForms();
						NSPraxManager.unsavedChanges = false;
					});
					$scope.editingModel = false;
				} else {
					$http.post('/api/forms', form).success(function () {
						loadForms();
						NSPraxManager.unsavedChanges = false;
					});
				}



			};

			/**
			 * Add question to subject form
			 */
			$scope.addQuestion = function (subject) {
				var modalInstance = $modal.open({
					templateUrl: 'newQuestion.html',
					controller: 'NewQuestionModalController',
					size: 'lg',
					resolve: {
						question: function () {
							return { 'question': { Type: null, 'Options': [], Question: '', Description: '' }, 'index': null }; // ;
						}
					}
				});

				modalInstance.result.then(function (question) {
					subject.Questions.push(question.question);
				}, function () {
					// no result
				});
			};


			/**
			 * Edit question
			 */
			$scope.editQuestion = function (subject, question, index) {

				var modalInstance = $modal.open({
					templateUrl: 'newQuestion.html',
					controller: 'NewQuestionModalController',
					size: 'lg',
					resolve: {
						question: function () {
							return { 'question': question, 'index': index };
						}
					}
				});

				modalInstance.result.then(function (question) {
					subject.Questions[question.index] = question.question;
				}, function () {
					// no result
				});

			};

			/**
			 * Edit subject
			 */
			$scope.editSubject = function (subject, $index) {
				var modalInstance = $modal.open({
					templateUrl: 'newSubject.html',
					controller: 'NewSubjectModalController',
					size: 'md',
					resolve: {
						subject: function () {
							return { 'subject': subject, 'index': $index }; // ;
						}
					}
				});

				modalInstance.result.then(function (subject) {
					$scope.form.Questions[$index] = subject.subject;
				}, function () {
					// no result
				});
			}

			/**
			 * Delete subject
			 */
			$scope.deleteSubject = function (subject, $index) {
				if (!confirm($t("Are you sure you want to delete this subject ?"))) {
					return;
				}
				$scope.form.Questions.splice($index, 1);
			}

			/**
			 * Preview form
			 */
			$scope.preview = function (form) {
				var modalInstance = $modal.open({
					templateUrl: 'previewForm.html',
					controller: 'PreviewModalController',
					size: 'lg',
					resolve: {
						form: function () {
							if (form) {
								return form;
							}
							return $scope.form;
						}
					}
				});

				modalInstance.result.then(function (question) {
					//subject.Questions.push(question.question);
				}, function () {
					// no result
				});
			};

			$scope.uploadForm = function () {
				var modalInstance = $modal.open({
					templateUrl: 'uploadForm.html',
					controller: 'UploadFormModalController',
					size: 'lg',
					resolve: {}
				});

				modalInstance.result.then(function (question) {
					$http.get('/api/forms').success(function (forms) {
						$scope.forms = forms;
					});
				}, function () {
					// no result
				});
			};

			/**
			 * Duplicate question
			 */
			$scope.duplicateQuestion = function (subject, question, $index) {
				var newQ = angular.copy(question);
				newQ.Question = newQ.Question + ' ( ' + $t('Copy') + ' ) ';
				subject.Questions.push(newQ);
			};

			/**
			 * Delete question
			 */
			$scope.deleteQuestion = function (subject, question, $index) {
				if (!confirm($t("Are you sure you want to delete this question ?"))) {
					return;
				}
				subject.Questions.splice($index, 1);
			};


		}]);

	/**
	 * New question modal controller
	 */
    NSPraxManager.controller('NewQuestionModalController', ['$scope', '$modalInstance', 'question', function ($scope, $modalInstance, question) {
		$scope.question = question.question;
		$scope.options = $scope.question.Options;
		$scope.form = true;
		$scope.addOption = false;
		$scope.option = '';

		/**
		 * Add question
		 */
		$scope.addQuestion = function () {
			question.question = $scope.question;
			question.question.Options = $scope.options;
			$modalInstance.close(question);
		};

		/**
		 * Cancel add new question
		 */
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		/**
		 * Add choice to question
		 */
		$scope.addChoice = function () {
			$scope.form = false;
			$scope.addOption = true;
		};

		/**
		 * Insert new choice in question
		 */
		$scope.addChoiceToQuestion = function () {
			$scope.options.push($scope.option);
			$scope.option = '';
			$scope.form = true;
			$scope.addOption = false;
		};


		/**
		 * Cancel add choice 
		 */
		$scope.cancelChoiceToQuestion = function () {
			$scope.form = true;
			$scope.addOption = false;
		}

		/**
		 * Remove option form question
		 */
		$scope.removeOption = function (option, index) {
			$scope.options.splice(index, 1);
		}


    }]);

	/**
	 * New subject controller
	 */
    NSPraxManager.controller('NewSubjectModalController', ['$scope', '$modalInstance', 'subject', function ($scope, $modalInstance, subject) {
		$scope.subject = subject.subject;

		/**
		 * Add subject to question
		 */
		$scope.addSubject = function () {
			subject.subject = $scope.subject;
			$modalInstance.close(subject);
		};

		/**
		 * Cancel add new subject to form
		 */
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
    }]);

    /**
	 * Preview modal controlle
	 */
    NSPraxManager.controller('PreviewModalController', ['$scope', '$modalInstance', 'form', function ($scope, $modalInstance, form) {
		$scope.form = angular.copy(form);

		/**
		 * Close preview modal
		 */
		$scope.close = function () {
			$modalInstance.dismiss('cancel');
		};

		/**
		 * Returns the remplate id for question type
		 */
		$scope.getTemplateUrl = function (question) {
			return 'questionControl' + question.Type + '.html';
		};
    }]);

	/**
 * Upload form modal controller
 */
    NSPraxManager.controller('UploadFormModalController', ['$scope', '$modalInstance', '$http',
		function ($scope, $modalInstance, $http, user) {
			$scope.error = false
			$scope.uploading = false;
			$scope.uploaded = false;

			/**
			 * Close modal
			 */
			$scope.close = function () {
				if ($scope.uploaded) {
					$modalInstance.close({});
				} else {
					$modalInstance.dismiss('cancel');
				}
			};

			/**
			 * Send password via email
			 */
			$scope.uploadForm = function (e) {
				e.preventDefault();
				var form = angular.element(e.target);
				$scope.uploading = true;
				uploadForm(form);
			};

			/**
			 * Upload file form
			 */
			function uploadForm(form) {

				$(form).ajaxSubmit({
					error: function (xhr) {
						$scope.$apply(function ($scope) {
							$scope.uploading = false;
							if (xhr.responseJSON) {
								$scope.error = xhr.responseJSON.Message;
								return;
							}

							$scope.error = $t('File upload error.');

						})
					}, success: function (response) {
						$scope.$apply(function ($scope) {
							$scope.uploading = false;
							$scope.uploaded = true;
							$scope.error = false;
						});
					}
				});
			}

		}]);
} ();
