(function() {
    'use strict';

    angular
        .module('app.layout')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$logProvider'];
    /* @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider, $logProvider){
      //$urlRouterProvider.otherwise("/");

      $stateProvider
        /*.state('dashboard', {
          url: '/',
          title: 'Home / Dashboard',

          views: {

            '@': {
              templateUrl: 'app/dashboard/dashboard.html',
              controller: 'DashboardController as vm'
            }
          }
        })*/
        /*.state('communities', {
          url: '/mycommunities',
          title: 'My Communities',
          views: {

            '@': {
              templateUrl: 'app/mycommunities/mycommunities.html',
              controller: 'CommunitiesController as vm',
            }
          }
        })*/
        .state('services', {
          url: '/myservices',
          title: 'My Services',
          abstract: true
        });
        /*.state('services-store', {
          url: '/services-store',
          title: 'Services Store',
          abstract: true
        })*/
    }

})();
