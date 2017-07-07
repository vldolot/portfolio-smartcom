(function() {
    'use strict';

    angular
        .module('app.community')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        var otherwise = '/mycommunity';
        routerHelper.configureStates(getStates(),otherwise);
    }

    function getStates() {
        return [
            {
                state: 'community',
                abstract: true,
                config: {
                    url: '/mycommunity',
                    title: 'My Community',
                    templateUrl: 'app/mycommunity/mycommunity.html',
                    controller: 'CommunityController as vm',
                    settings: {
                    }
                }
            },
            {
                state: 'community.form',
                config: {
                    url: '/action/:action',
                    title: 'My Community',
                    params: { groupObj: null, showTab: null },
                    views: {
                      '@': {
                          templateUrl: 'app/mycommunity/community-form.tmpl.html',
                          controller: 'CommunityFormController as vm'
                      }
                    }
                }
            }

        ];
    }
})();
