(function() {
    'use strict';

    angular
        .module('app.services')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        //console.log();
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'services.broadcast',
                config: {
                    url: '/broadcast',
                    title: 'My Services - Broadcast',
                    views: {
                      '@': {
                        templateUrl: 'app/myservices/services.broadcast.html',
                        controller: 'BroadcastController as vm'
                      }
                    },
                }
            },
            {
                state: 'services.boombastext',
                config: {
                    url: '/boombastext',
                    title: 'My Services - Boombastext',
                    views: {
                      '@': {
                        templateUrl: 'app/myservices/services.boombastext.html',
                        controller: 'BoombastextController as vm'
                      }
                    },
                }
            },
            {
                state: 'services.which',
                config: {
                    url: '/which',
                    title: 'My Services - Which',
                    views: {
                      '@': {
                        templateUrl: 'app/myservices/services.which.html',
                        controller: 'WhichController as vm'
                      }
                    },
                    settings: {
                    }
                }
            }

        ];
    }
})();
