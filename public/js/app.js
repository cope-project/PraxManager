/**
 * Main application
 */

// define application
var NSPraxManager = angular.module('PraxManager', ['ui.calendar', 'ui.bootstrap', 'angularMoment'])

!function () {
    /**
     * Notifications controller
     */
    NSPraxManager.controller('NotificationsController', ['$scope', '$http', function ($scope, $http) {
	       $scope.notifications = []

	       $http.get('/notifications').success(function (notifications) {
            $scope.notifications = notifications
	       })

    }])
    
    // setup timezone
    //moment.tz.add('Etc/UTC|Etc/Universal');
    NSPraxManager.constant('angularMomentConfig', { timezone: null });
    
    // setup application
    NSPraxManager.run(['amMoment', function (amMoment) {
        if (PraxManager_lang == 'dk') {
            PraxManager_lang = 'da';
        }

        if (PraxManager_lang == 'cz') {
            PraxManager_lang = 'cs';
        }

        if (PraxManager_lang == 'ct') {
            PraxManager_lang = 'ca';
        }

        amMoment.changeLocale(PraxManager_lang);
    }]);

    NSPraxManager.unsavedChanges = false;

    window.onbeforeunload = function (e) {
        if (NSPraxManager.unsavedChanges) {
            return 'The current window has unsaved changes.';
        }
    };
} ();
