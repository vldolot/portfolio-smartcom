(function() {
    'use strict';

    angular
        .module('app.servicesStore')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'services-store',
                config: {
                    url: '/services-store',
                    templateUrl: 'app/services-store/services-store.html',
                    controller: 'ServicesStoreController',
                    controllerAs: 'vm',
                    title: 'Services Store',
                    settings: {
                    }
                }
            }
        ];
    }
})();
