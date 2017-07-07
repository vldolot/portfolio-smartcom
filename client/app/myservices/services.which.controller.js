(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('WhichController', WhichController);

    WhichController.$inject = ['$q', '$scope', '$log'];
    
    /* @ngInject */
    function WhichController($q, $scope, $log) {
        var vm = this;
        vm.title = 'My Services - Which';
        vm.isOpen = false;
        activate();
        ////////////////
        function activate() {
          $log.info('Activated My Services - Which View');
        }
    }
})();