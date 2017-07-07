(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('ShellController', ShellController);

    ShellController.$inject = ['$rootScope', '$timeout', '$mdSidenav', '$mdDialog', '$state',
      'config', '$log', '$mdBottomSheet'];
    /* @ngInject */
    function ShellController($rootScope, $timeout, $mdSidenav, $mdDialog, $state, config, $log, $mdBottomSheet) {
        var vm = this;
        vm.title = config.appTitle + " - " + $state;
        vm.toggleLeftMenu = buildDelayedToggler('left');

        /**
         * Supplies a function that will continue to operate until the
         * time is up.
         */
        function debounce(func, wait, context) {
          var timer;
          return function debounced() {
            var context = vm,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
              timer = undefined;
              func.apply(context, args);
            }, wait || 10);
          };
        }
        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildDelayedToggler(navID) {
          return debounce(function() {
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                $log.info("toggle " + navID + " is done");
              });
          }, 200);
        }

        var originatorEv;
        vm.openMenu = function($mdOpenMenu, ev) {
          originatorEv = ev;
          $mdOpenMenu(ev);
        };

        vm.announceClick = function(index) {
          $mdDialog.show(
            $mdDialog.alert()
              .title('You clicked!')
              .textContent('You clicked the menu item at index ' + index)
              .ok('Nice')
              .targetEvent(originatorEv)
          );
          originatorEv = null;
        };

        vm.showListBottomSheet = function($event) {          
          $mdBottomSheet.show({
            templateUrl: 'app/layout/bottom-sheet-list-tmpl.html',
            controller: ListBottomSheetCtrl,
            targetEvent: $event
          }).then(function(clickedItem) {
            $log.info(clickedItem.name + ' clicked!');
          });
        };

        ListBottomSheetCtrl.$inject = ['$scope', '$mdBottomSheet'];
        /* @ngInject */
        function ListBottomSheetCtrl($scope, $mdBottomSheet){
          $scope.headerTitle = 'Settings';
          $scope.items = [{
              name: 'Share',
              icon: 'share'
            }, {
              name: 'Upload',
              icon: 'cloud_upload'
            }, {
              name: 'Copy',
              icon: 'content_copy'
            }, {
              name: 'Print this page',
              icon: 'print'
            }, 
          ];

          $scope.listItemClick = function($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
          };
        }

        /*activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!', null);
            hideSplash();
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function() {
                $rootScope.showSplash = false;
            }, 1000);
        }*/
    }
})();
