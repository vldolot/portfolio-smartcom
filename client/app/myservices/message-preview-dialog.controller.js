(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('MessagePreviewDialogCtrl', MessagePreviewDialogCtrl);

    MessagePreviewDialogCtrl.$inject = ['$scope', '$mdDialog', '$rootScope', '$log', 'mode', 'parent'];
    
    /* @ngInject */
    function MessagePreviewDialogCtrl($scope, $mdDialog, $rootScope, $log, mode, parent) {
        var vm = this;

	      vm.dialogTitle = 'Message Preview';
	      vm.mode = mode;

	      vm.messageDetailsModel = []; 
			  vm.query = {
			    order: 'network',
			    limit: 5,
			    page: 1
			  };

			  vm.messageDetails = [
			  	{ network: 'SMART', recipients: 1, characters: 100, sms: 1 },
			  	{ network: 'GLOBE', recipients: 0, characters: 0, sms: 0 },
			  	{ network: 'SUN', recipients: 0, characters: 0, sms: 0 }
			  ];

        ////////////////

	      $scope.hide = function() {
	        $mdDialog.hide(); 
	      };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

	      $scope.action = function(action) {
	        if (action == 'send'){
	        	// send message to recipients

	        } else if (action == 'cancel'){
	          $mdDialog.cancel();
	        }
	      };

    }
})();