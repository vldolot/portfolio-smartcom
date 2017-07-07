(function() {
    'use strict';

    angular
        .module('app.servicesStore')
        .controller('ServicesStoreController', ServicesStoreController);

    ServicesStoreController.$inject = ['$q', 'logger'];
    /* @ngInject */
    function ServicesStoreController($q, logger) {
        var vm = this;
        vm.title = 'Services Store';

        activate();

        ////////////////

        function activate() {
          logger.info('Activated Services Store View');
        }
    }
})();