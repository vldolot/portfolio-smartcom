(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('BoombastextController', BoombastextController);

    BoombastextController.$inject = ['$q', '$scope', '$log'];
    
    /* @ngInject */
    function BoombastextController($q, $scope, $log) {
        var vm = this;
        vm.title = 'My Services - Boombastext';
        vm.isOpen = false;
        activate();
        ////////////////
        function activate() {
          $log.info('Activated My Services - Boombastext View');
        }
    }
})();