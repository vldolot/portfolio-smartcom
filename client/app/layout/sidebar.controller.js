(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$rootScope', '$log', '$state', '$timeout', 
                                 '$location', 'sideNav', 'sideNavService', 'routerHelper', '$mdSidenav'];
    /* @ngInject */
    function SidebarController($rootScope, $log, $state, $timeout, 
        $location, sideNav, sideNavService, routerHelper, $mdSidenav) {
        var vm = this;

        vm.isOpen = isOpen;
        vm.toggleOpen = toggleOpen;
        vm.autoFocusContent = false;
        //vm.menu = sideNav;
        buildSideNav();

        //var states = routerHelper.getStates();
        vm.isCurrent = isCurrent;
        
        vm.status = {
          isFirstOpen: true,
          isFirstDisabled: false
        };
        
        vm.closeNav = closeNav;

        /* @ngInject */
        function isOpen(section) {
          return sideNav.isSectionSelected(section);
        }

        /* @ngInject */
        function toggleOpen(section) {
          sideNav.toggleSelectSection(section);
        }

        function closeNav(section){
          $mdSidenav(section).close()
            .then(function () {
              $log.debug("close LEFT is done");
          });          
        }

        activate();

        function activate() {
        }

        function buildSideNav() {
            sideNavService.getSideNavData.then(function (result) {
                vm.menu = result.data;
            }, function (result) {
                $log.error("SideNav menu data not available, Error: " + result);
            });
        }

        /*function getNavRoutes() {
            vm.navRoutes = states.filter(function(r) {
                console.log("r.settings: " + r.settings);
                console.log("r.settings.nav: " + r.settings.nav);
                return r.settings && r.settings.nav;
            }).sort(function(r1, r2) {
                return r1.settings.nav - r2.settings.nav;
            });
        }*/

        function isCurrent(section) {
            //console.log("section.state: " + section.state + " $state.current.title: " + $state.current.title + " $state.current.name: " + $state.current.name);

            if (!section.state || !$state.current || !$state.current.name) {
                return '';
            }

            $rootScope.currentPageTitle = $state.current.title;

            //var menuName = (!angular.isUndefined(section.pages) && !angular.isUndefined(section.pages.length > 0)) ? section.pages.state : section.state;
            var menuName = section.state;

            //console.log("$state.current.name: " + $state.current.name + " | menuName: " + menuName);
            return $state.current.name.substr(0, menuName.length) === menuName ? 'current' : '';
        }
    }
})();
