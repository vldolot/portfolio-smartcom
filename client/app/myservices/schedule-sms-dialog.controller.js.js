(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('ScheduleSMSDialogCtrl', ScheduleSMSDialogCtrl);

    ScheduleSMSDialogCtrl.$inject = ['$scope', '$mdDialog', '$rootScope', '$log', 'mode', 'parent'];
    
    /* @ngInject */
    function ScheduleSMSDialogCtrl($scope, $mdDialog, $rootScope, $log, mode, parent) {
        var vm = this;

	      vm.dialogTitle = 'Schedule Your Text Message For Later Delivery'; 
	      vm.mode = mode;

        ////////////////

	      $scope.hide = function() {
	        $mdDialog.hide(); 
	      };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

	      $scope.action = function(action) {
	        if (action == 'schedule'){
	        	// schedule message for later delivery

	        } else if (action == 'cancel'){
	          $mdDialog.cancel();
	        }
	      };

    }
})();