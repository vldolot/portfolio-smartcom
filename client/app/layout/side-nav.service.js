(function() {
    'use strict';

    angular
      .module('app.layout')
      .factory('sideNav', sideNav)
      .service('sideNavService', sideNavService);

    sideNav.$inject = ['$location'];
    /* @ngInject */
    function sideNav($location) {

        /*var sections = [{
          name: 'Home / Dashboard',
          state: 'dashboard',
          type: 'link',
          icon: 'dashboard'
        }];

        sections.push({
          name: 'My Communities',
          state: 'communities',
          type: 'link',
          icon: 'supervisor_account'
        });

        sections.push({
          name: 'My Services',
          state: 'services',
          type: 'toggle',
          icon: 'group_work',
          pages: [{
            name: 'Boombastext',
            type: 'link',
            state: 'services.boombastext',
            icon: 'forum'
          }, 
          {
            name: 'Send SMS',
            state: 'services.sendsms',
            type: 'link',
            icon: 'textsms'
          },
          {
            name: 'Which',
            state: 'services.which',
            type: 'link',
            icon: 'poll'
          }]
        });

        sections.push({
          name: 'Services Store',
          state: 'services-store',
          type: 'link',
          icon: 'store'
        });*/

          /*sideNavData: "app/api/sideNavData.json",*/
        var service = {

          toggleSelectSection: function (section) {
            service.openedSection = (service.openedSection === section ? null : section);
          },
          isSectionSelected: function (section) {
            return service.openedSection === section;
          },

          selectPage: function (section, page) {
            console.log("page: " + page + " page.url: " + page.url + " $location.path(page.url): " + $location.path(page.url));
            page && page.url && $location.path(page.url);
            service.currentSection = section;
            service.currentPage = page;
          }
        };

        return service;

        ////////////////

        function sortByHumanName(a, b) {
          return (a.humanName < b.humanName) ? -1 :
            (a.humanName > b.humanName) ? 1 : 0;
        }
    }

    sideNavService.$inject = ['$http','sideNav'];
    /* @ngInject */
    function sideNavService($http, sideNav){
      var sideNavdata = "app/api/sideNavData.json";
      this.getSideNavData = getSideNavData();

      ////////////////

      function getSideNavData() {
        return $http.get(sideNavdata);
      }
    }
})();