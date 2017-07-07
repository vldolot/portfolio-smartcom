/** Application Modules */
(function() {
    'use strict';
    
    angular
      .module('app', [
	        'app.core',
	        'app.layout',
	        'app.dashboard',
	        'app.community',
	        'app.services',
	        'app.servicesStore'
      ]);
})();
(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            'ui.router', 'ngAria', 'ngMaterial', 'ngMessages',
            'angular-loading-bar', 'angularBootstrapNavTree',
            'LocalStorageModule', 'dynform', 'cgBusy','ui.bootstrap',
            'dndLists', 'md.data.table'
        ]);
})();

(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(toastrConfig);

    toastrConfig.$inject = ['toastr'];
    /* @ngInject */
    function toastrConfig(toastr) {
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    var config = {
        appErrorPrefix: '[SmartCommunities Error] ',
        appTitle: 'Smart Communities'
    };

    core.value('config', config);

    core.config(configure);

    configure.$inject = ['$logProvider', 'routerHelperProvider', 'exceptionHandlerProvider'];
    /* @ngInject */
    function configure($logProvider, routerHelperProvider, exceptionHandlerProvider) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(config.appErrorPrefix);
        routerHelperProvider.configure({docTitle: config.appTitle + ': '});
    }

    core.config(configHttp);

    configHttp.$inject = ['$httpProvider'];
    /* @ngInject */
    function configHttp($httpProvider) {
      $httpProvider.defaults.useXDomain = true;
      $httpProvider.defaults.withCredentials = true;
      delete $httpProvider.defaults.headers.common["X-Requested-With"];
      $httpProvider.defaults.headers.common.Accept = "application/json"; //['Accept']
      $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    }

    core.config(localStorageConfig);

    localStorageConfig.$inject = ['localStorageServiceProvider'];
    /* @ngInject */
    function localStorageConfig(localStorageServiceProvider) {
      localStorageServiceProvider
        .setPrefix('lstore')
        .setStorageType('sessionStorage')
        .setNotify(true, true);
    }

    core.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
    }]);

    //take all whitespace out of string
    core.filter('nospace', function () {
      return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
    });

    //replace uppercase to regular case
    core.filter('humanizeDoc', function () {
      return function (doc) {
        if (!doc) return;
        if (doc.type === 'directive') {
          return doc.name.replace(/([A-Z])/g, function ($1) {
            return '-' + $1.toLowerCase();
          });
        }

        return doc.label || doc.name;
      };
    });

    core.filter('sanitize', ['$sce', function($sce) {
      return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
      };
    }]);

})();

/* global toastr:false, moment:false */
(function() {
    'use strict';

    angular
        .module('app.core')
        .constant('toastr', toastr)
        .constant('moment', moment)
        .constant('_', window._);
})();

(function() {
    'use strict';

    angular
        .module('app.core')
        .run(appRun);

    /* @ngInject */
    function appRun(routerHelper, $rootScope) {
      var otherwise = '/';
      routerHelper.configureStates(getStates(), otherwise);

      $rootScope.stringToArr = stringToArr;
    }

    function getStates() {
      return [
        {
          state: '404',
          config: {
            url: '/404',
            templateUrl: 'app/core/404.html',
            title: '404'
          }
        }
      ];
    }

    function stringToArr (str) {
      var arrayOfRounds = str.split(",").map(function (intervalString) {
        var key = parseInt(intervalString, 10) + "";
        var val = intervalString.substring(intervalString.indexOf(':') + 1, intervalString.length);

        return { key: key, name: val };
      });

      //JSON.stringify(arrayOfRounds)
      return arrayOfRounds;
    }
})();

(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('DataService', dataservice);

    dataservice.$inject = ['$http', '$q', 'exception', 'logger'];
    /* @ngInject */
    function dataservice($http, $q, exception, logger) {
        var mongoDBurl = 'http://localhost:8080';

        var service = {
            getGroupData: getGroupData,
            getUserData: getUserData,
            getProfileFieldData: getProfileFieldData,
            getRoleData: getRoleData,
            saveGroupData: saveGroupData,
            saveUserData: saveUserData,
            saveProfileFieldData: saveProfileFieldData,
            saveRoleData: saveRoleData,
            deleteGroupData: deleteGroupData,
            deleteUserData: deleteUserData,
            deleteProfileFieldData: deleteProfileFieldData,
            deleteRoleData: deleteRoleData,
        };

        return service;

        /*function getMessageCount() { return $q.when(72); }*/

        /* GROUPS */

        function getGroupData (selector, value) {
          if (selector && selector.length > 0){
            if (selector == 'id'){
              return $http.get(mongoDBurl + '/api/groups/' + value);
            } else if (selector == 'level'){
              return $http.get(mongoDBurl + '/api/groups/level/' + value);
            } else if (selector == 'parentid'){
              return $http.get(mongoDBurl + '/api/groups/parentid/' + value);
            }
          } else {
            return $http.get(mongoDBurl + '/api/groups');
          }
        }

        function saveGroupData (action, content, id) {
          if (action && action.length > 0){
            var data = $.param({ jsonData: JSON.stringify(content) });

            if (action == 'insert'){
              return $http({
                method: 'POST',
                url: mongoDBurl + '/api/groups',
                data: data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              });

            } else if (action == 'update'){
              if (typeof id != 'undefined'){
                return $http({
                  method: 'PUT',
                  url: mongoDBurl + '/api/groups/' + id,
                  data: data,
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                });
              }
            }
          }
        }

        function deleteGroupData (id) {
          if (typeof id != 'undefined'){
            return $http({
              method: 'DELETE',
              url: mongoDBurl + '/api/groups/' + id
            });
          }
        }

        /* end GROUPS */

        /* USERS */

        function getUserData (selector, value) {
          if (selector && selector.length > 0){
            if (selector == 'id'){
              return $http.get(mongoDBurl + '/api/users/' + value);
            } else if (selector == 'groups'){
              return $http.get(mongoDBurl + '/api/users/groups/' + value);
            }
          } else {
            return $http.get(mongoDBurl + '/api/users');
          }
        }

        function saveUserData (action, content, id) {
          if (action && action.length > 0){
            var data = $.param({ jsonData: JSON.stringify(content) });
            console.log(data);

            if (action == 'insert'){
              return $http({
                method: 'POST',
                url: mongoDBurl + '/api/users',
                data: data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              });
            } else if (action == 'update'){
              if (typeof id != 'undefined'){
                return $http({
                  method: 'PUT',
                  url: mongoDBurl + '/api/users/' + id,
                  data: data,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
              }
            }
          }
        }

        function deleteUserData (id) {
          if (id && id.length > 0){
            return $http({
              method: 'DELETE',
              url: mongoDBurl + '/api/users/' + id
            });
          }
        }

        /* end USERS */

        /* PROFILE FIELDS */

        function getProfileFieldData (selector, value) {
          if (selector && selector.length > 0){
            if (selector == 'id'){
              return $http.get(mongoDBurl + '/api/profilefields/' + value);
            } else if (selector == 'model'){
              return $http.get(mongoDBurl + '/api/profilefields/model/' + value);
            }
          } else {
            return $http.get(mongoDBurl + '/api/profilefields');
          }
        }

        function saveProfileFieldData (action, content, id) {
          if (action && action.length > 0){
            if (action == 'insert'){
              return $http({
                method: 'POST',
                url: mongoDBurl + '/api/profilefields',
                data: '{ jsonData: '+content+' }',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              });
            } else if (action == 'update'){
              if (typeof id != 'undefined'){
                return $http({
                  method: 'PUT',
                  url: mongoDBurl + '/api/profilefields/' + id,
                  data: '{ jsonData: '+content+' }',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
              }
            }
          }
        }

        function deleteProfileFieldData (id) {
          if (id && id.length > 0){
            return $http({
              method: 'DELETE',
              url: mongoDBurl + '/api/profilefields/' + id
            });
          }
        }

        /* end PROFILE FIELDS */

        /* ROLES */

        function getRoleData (selector, value) {
          if (selector && selector.length > 0){
            if (selector == 'id'){
              return $http.get(mongoDBurl + '/api/roles/' + value);
            } else if (selector == 'key'){
              return $http.get(mongoDBurl + '/api/roles/key/' + value);
            }
          } else {
            return $http.get(mongoDBurl + '/api/roles');
          }
        }

        function saveRoleData (action, content, id) {
          if (action && action.length > 0){
            if (action == 'insert'){
              return $http({
                method: 'POST',
                url: mongoDBurl + '/api/roles',
                data: '{ jsonData: '+content+' }',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              });
            } else if (action == 'update'){
              if (typeof id != 'undefined'){
                return $http({
                  method: 'PUT',
                  url: mongoDBurl + '/api/roles/' + id,
                  data: '{ jsonData: '+content+' }',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
              }
            }
          }
        }

        function deleteRoleData (id) {
          if (id && id.length > 0){
            return $http({
              method: 'DELETE',
              url: mongoDBurl + '/api/roles/' + id
            });
          }
        }

        /* end ROLES */
    }
})();

(function() {
    'use strict';

    angular.module('blocks.exception', ['blocks.logger']);
})();

(function() {
    'use strict';

    angular.module('blocks.logger', []);
})();

(function() {
    'use strict';

    angular.module('blocks.router', [
        'ui.router',
        'blocks.logger'
    ]);
})();

// Include in index.html so that app level exceptions are handled.
// Exclude from testRunner.html which should run exactly what it wants to run
(function() {
    'use strict';

    angular
        .module('blocks.exception')
        .provider('exceptionHandler', exceptionHandlerProvider)
        .config(config);

    /**
     * Must configure the exception handling
     */
    function exceptionHandlerProvider() {
        /* jshint validthis:true */
        this.config = {
            appErrorPrefix: undefined
        };

        this.configure = function (appErrorPrefix) {
            this.config.appErrorPrefix = appErrorPrefix;
        };

        this.$get = function() {
            return {config: this.config};
        };
    }

    config.$inject = ['$provide'];

    /**
     * Configure by setting an optional string value for appErrorPrefix.
     * Accessible via config.appErrorPrefix (via config value).
     * @param  {Object} $provide
     */
    /* @ngInject */
    function config($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
    }

    extendExceptionHandler.$inject = ['$delegate', 'exceptionHandler', 'logger'];

    /**
     * Extend the $exceptionHandler service to also display a toast.
     * @param  {Object} $delegate
     * @param  {Object} exceptionHandler
     * @param  {Object} logger
     * @return {Function} the decorated $exceptionHandler service
     */
    function extendExceptionHandler($delegate, exceptionHandler, logger) {
        return function(exception, cause) {
            var appErrorPrefix = exceptionHandler.config.appErrorPrefix || '';
            var errorData = {exception: exception, cause: cause};
            exception.message = appErrorPrefix + exception.message;
            $delegate(exception, cause);
            /**
             * Could add the error to a service's collection,
             * add errors to $rootScope, log errors to remote web server,
             * or log locally. Or throw hard. It is entirely up to you.
             * throw exception;
             *
             * @example
             *     throw { message: 'error message we added' };
             */
            logger.error(exception.message, errorData);
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('blocks.exception')
        .factory('exception', exception);

    /* @ngInject */
    function exception($q, logger) {
        var service = {
            catcher: catcher
        };
        return service;

        function catcher(message) {
            return function(e) {
                var thrownDescription;
                var newMessage;
                if (e.data && e.data.description) {
                    thrownDescription = '\n' + e.data.description;
                    newMessage = message + thrownDescription;
                }
                e.data.description = newMessage;
                logger.error(newMessage);
                return $q.reject(e);
            };
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('blocks.logger')
        .factory('logger', logger);

    logger.$inject = ['$log', 'toastr'];

    /* @ngInject */
    function logger($log, toastr) {
        var service = {
            showToasts: true,

            error   : error,
            info    : info,
            success : success,
            warning : warning,

            // straight to console; bypass toastr
            log     : $log.log
        };

        return service;
        /////////////////////

        function error(message, data, title) {
            toastr.error(message, title);
            $log.error('Error: ' + message, data);
        }

        function info(message, data, title) {
            toastr.info(message, title);
            $log.info('Info: ' + message, data);
        }

        function success(message, data, title) {
            toastr.success(message, title);
            $log.info('Success: ' + message, data);
        }

        function warning(message, data, title) {
            toastr.warning(message, title);
            $log.warn('Warning: ' + message, data);
        }
    }
}());

/* Help configure the state-base ui.router */
(function() {
    'use strict';

    angular
        .module('blocks.router')
        .provider('routerHelper', routerHelperProvider);

    routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
    /* @ngInject */
    function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {
        /* jshint validthis:true */
        var config = {
            docTitle: undefined,
            resolveAlways: {}
        };

        $locationProvider.html5Mode(true);

        this.configure = function(cfg) {
            angular.extend(config, cfg);
        };

        this.$get = RouterHelper;
        RouterHelper.$inject = ['$location', '$rootScope', '$state', 'logger'];
        /* @ngInject */
        function RouterHelper($location, $rootScope, $state, logger) {
            var handlingStateChangeError = false;
            var hasOtherwise = false;
            var stateCounts = {
                errors: 0,
                changes: 0
            };

            var service = {
                configureStates: configureStates,
                getStates: getStates,
                stateCounts: stateCounts
            };

            init();

            return service;

            ///////////////

            function configureStates(states, otherwisePath) {
                states.forEach(function(state) {
                    state.config.resolve =
                        angular.extend(state.config.resolve || {}, config.resolveAlways);
                    $stateProvider.state(state.state, state.config);
                });
                if (otherwisePath && !hasOtherwise) {
                    hasOtherwise = true;
                    $urlRouterProvider.otherwise(otherwisePath);
                }
            }

            function handleRoutingErrors() {
                // Route cancellation:
                // On routing error, go to the dashboard.
                // Provide an exit clause if it tries to do it twice.
                $rootScope.$on('$stateChangeError',
                    function(event, toState, toParams, fromState, fromParams, error) {
                        if (handlingStateChangeError) {
                            return;
                        }
                        stateCounts.errors++;
                        handlingStateChangeError = true;
                        var destination = (toState &&
                            (toState.title || toState.name || toState.loadedTemplateUrl)) ||
                            'unknown target';
                        var msg = 'Error routing to ' + destination + '. ' +
                            (error.data || '') + '. <br/>' + (error.statusText || '') +
                            ': ' + (error.status || '');
                        logger.warning(msg, [toState]);
                        $location.path('/');
                    }
                );
            }

            function init() {
                handleRoutingErrors();
                updateDocTitle();
            }

            function getStates() { return $state.get(); }

            function updateDocTitle() {
                $rootScope.$on('$stateChangeSuccess',
                    function(event, toState, toParams, fromState, fromParams) {
                        stateCounts.changes++;
                        handlingStateChangeError = false;
                        var title = config.docTitle + ' ' + (toState.title || '');
                        $rootScope.title = title; // data bind to <title>
                    }
                );
            }
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.layout', ['app.core']);
})();

(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('htSidebar', htSidebar);

    /* @ngInject */
    function htSidebar () {
        // Opens and closes the sidebar menu.
        // Usage:
        //  <div ht-sidebar">
        //  <div ht-sidebar whenDoneAnimating="vm.sidebarReady()">
        // Creates:
        //  <div ht-sidebar class="sidebar">
        var directive = {
            link: link,
            restrict: 'EA',
            scope: {
                whenDoneAnimating: '&?'
            }
        };
        return directive;

        function link(scope, element, attrs) {
            var $sidebarInner = element.find('.sidebar-inner');
            var $dropdownElement = element.find('.sidebar-dropdown a');
            element.addClass('sidebar');
            $dropdownElement.click(dropdown);

            function dropdown(e) {
                var dropClass = 'dropy';
                e.preventDefault();
                if (!$dropdownElement.hasClass(dropClass)) {
                    $sidebarInner.slideDown(350, scope.whenDoneAnimating);
                    $dropdownElement.addClass(dropClass);
                } else if ($dropdownElement.hasClass(dropClass)) {
                    $dropdownElement.removeClass(dropClass);
                    $sidebarInner.slideUp(350, scope.whenDoneAnimating);
                }
            }
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('htTopNav', htTopNav);

    /* @ngInject */
    function htTopNav () {
        var directive = {
            bindToController: true,
            controller: TopNavController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {
                'navline': '='
            },
            templateUrl: 'app/layout/ht-top-nav.html'
        };

        /* @ngInject */
        function TopNavController() {
            var vm = this;
        }

        return directive;
    }
})();

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

(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('sideNavLink', sideNavLink);

    sideNavLink.$inject = ['$http'];

    /* @ngInject */
    function sideNavLink($http) {
        // Usage:
        //
        // Creates:
        //
        var directive = {            
            link: link,
            restrict: 'EA',
            scope: {
            	section: '='
            },
            templateUrl: 'app/layout/side-nav-link.html'
        };
        return directive;

        //////////////////

        function link(scope, element) {
          var controller = element.parent().controller();
          var parentNodeClosed = element[0].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode; //element[0].parentNode.parentNode.parentNode;

          scope.closeNav = function () {
            // set flag to be used later when
            // $locationChangeSuccess calls openPage()
            /*$http.get(url)
            .then(function(response){
              console.log(response);
            })*/
            //console.log("parentNode with md-closed: " + parentNodeClosed.classList.contains('md-closed'));
            controller.autoFocusContent = true;
            if (!parentNodeClosed.classList.contains('md-closed')){
              controller.closeNav('left');
            }
          };
        }
        
        /* @ngInject */
        /*function sideNavLinkController() {
          var vm = this;
        }*/
    }
    
})();
(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('sideNavToggle', sideNavToggle);

    sideNavToggle.$inject = ['$timeout', '$state'];

    /* @ngInject */
    function sideNavToggle($timeout, $state) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'E',
            scope: {
            	section: '='
            },
            templateUrl: 'app/layout/side-nav-toggle.html'
        };
        return directive;

        //////////////////

        function link(scope, element) {
          var controller = element.parent().controller();

          scope.isOpen = function () {
            return controller.isOpen(scope.section);
          };
          scope.toggle = function () {
            controller.toggleOpen(scope.section);
          };

          scope.closeNav = function() {
            //controller.closeNav(scope.section);
            controller.closeNav('left');
          };

          var parentNodeClosed = element[0].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
          //console.log("parentNode with md-closed: " + parentNodeClosed.classList.contains('md-closed'));

          scope.isCurrent = function(page){
            return $state.current.name.substr(0, page.state.length) === page.state ? 'current' : '';
          };

          var parentNode = element[0].parentNode; //element[0].parentNode.parentNode.parentNode;
          //console.log("parentNode: " + parentNode.classList.contains('parent-list-item'));

          if (parentNode.classList.contains('parent-list-item')) {
            var heading = parentNode.querySelector('span');
            //console.log("heading: " + heading.id);
            element[0].firstChild.setAttribute('aria-describedby', heading.id);
          }
        }

        /* @ngInject */
        /*function sideNavToggleController() {
            var vm = this;
        }*/
    }

})();

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

(function() {
    'use strict';

    angular.module('app.dashboard', [
        'app.core'        
      ]);
    /*'app.widgets'*/
})();

(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', '$log']; /*'dataservice', */
    /* @ngInject */
    function DashboardController($q, $log) { /*dataservice, */
        var vm = this;
        /*vm.news = {
            title: 'SmartCommunities',
            description: 'Welcome to SmartCommunities!'
        };*/
        vm.groupMsgsCount = 30;
        vm.privMsgsCount = 50;
        vm.newServicesCount = 3;
        vm.title = 'Home / Dashboard';

        activate();

        function activate() {
            var promises = [getMessageCount(), getPeople()];
            return $q.all(promises).then(function() {
                $log.info('Activated Dashboard View');
            });
        }

        function getMessageCount() {
            return 1234;
            /*dataservice.getMessageCount().then(function (data) {
                vm.messageCount = data;
                return vm.messageCount;
            });*/
        }

        function getPeople() {
            return undefined;
            /*dataservice.getPeople(function (data) {
                vm.people = data;
                return vm.people;
            });*/
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app.dashboard')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        var otherwise = '/';
        routerHelper.configureStates(getStates(),otherwise);
    }

    function getStates() {
        return [
            {
                state: 'dashboard',
                config: {
                    url: '/',
                    templateUrl: 'app/dashboard/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm',
                    title: 'Home / Dashboard',
                    settings: {
                    }
                }
            }
        ];
    }
})();

(function() {
    'use strict';
    
    angular
        .module('app.community', [
            'app.core'
        ]);
})();
(function() {
    'use strict';

    angular
        .module('app.community')
        .config(themeProvider)
        .controller('CommunityFormController', CommunityFormController);

    themeProvider.$inject = ['$mdThemingProvider'];
    /* @ngInject */
    function themeProvider($mdThemingProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('light-green');
    }

    CommunityFormController.$inject = ['$q', '$scope', '$log', 'DataService', '$state',
                                       '$stateParams', 'localStorageService', '$filter',
                                       '$timeout', '$rootScope', '$element', '$mdDialog'];
    /* @ngInject */
    function CommunityFormController($q, $scope, $log, DataService, $state,
                                     $stateParams, localStorageService, $filter,
                                     $timeout, $rootScope, $element, $mdDialog) {
        var vm = this;

        var action = $stateParams.action;
        var selectedGroup = $stateParams.groupObj;
        var selectedTab = $stateParams.showTab;
        var treeData = localStorageService.get('treeData');
        var memberFieldsData;

        vm.groupData = [];
        vm.allMembers = [];
        vm.membersChips = [];
        vm.selectedMembers = [];
        vm.csvFile = [];

        vm.editMode = false;
        vm.addMemberDisabled = true;

        loadAllMembers();
        loadMemberFields();

        if (action && action.length) {
          if (action == 'add'){
            vm.selectedTab = 0;

            $state.current.title = 'My Community - Add';
            vm.dialogTitle = 'Add Sub-Group for <strong>' + selectedGroup.label + '</strong>';

            // vm.step2locked = true;
            // vm.step3locked = true;
            vm.btnNext1 = true;
            vm.btnNext2 = true;
          } else if (action == 'edit'){
            vm.editMode = true;

            loadGroupData('id',selectedGroup._id);

            //$log.warn($stateParams.showTab);
            if (selectedTab == 'members'){ vm.selectedTab = 0; }
            else if (selectedTab == 'profile'){ vm.selectedTab = 1; }
            else { vm.selectedTab = -1; }

            $state.current.title = 'My Community - Edit';
            vm.dialogTitle = 'Edit Sub-Group: <strong>' + selectedGroup.label + '</strong>';

            //memberFieldsData = localStorageService.get('memberFieldsData');

            // vm.step2locked = false;
            // vm.step3locked = false;
            vm.btnNext1 = false;
            vm.btnNext2 = false;
          } else {
            $state.current.title = 'My Community';
            vm.dialogTitle = 'Sub-Group: <strong>' + selectedGroup.label + '</strong>';

            // memberFieldsData = localStorageService.get('memberFieldsData');
          }
        }

        vm.max = 2;
        vm.formAction = formActionHandler;
        vm.updateTabs = updateTabs;

        vm.types = [{name: 'text'}, {name: 'email'}, {name: 'number'}];
        vm.fieldType = vm.types[0].name;

        // PROFILE FIELDS
        vm.allProfileFields = [];
        vm.customProfileFields = [];
        vm.defaultProfileFields = [];
        vm.selectedField = null;
        vm.fieldSearchText = null;
        vm.toggleReadOnly = false;

        vm.profileFieldsAction = profileFieldsActionHandler;
        vm.selectedFieldChange = selectedFieldChangeHandler;
        vm.selectedFieldsAction = selectedFieldsActionHandler;

        vm.dndListHandler = dndListHandler;
        vm.dndListOnDrop = dndListOnDrop;
        vm.getSelectedItemsIncluding = getSelectedItemsIncluding;

        vm.querySearch = querySearch;
        vm.filterFieldsSearch = filterFieldsSearch;

        // TAB 3
        vm.selectedMember = null;
        vm.memberSearchText = null;
        vm.memberRoles = [
          {
            id: 1,
            key: "company_admin",
            name: "Company Admin"
          },
          {
            id: 2,
            key: "group_admin",
            name: "Group Admin"
          },
          {
            id: 3,
            key: "member",
            name: "Member"
          },
        ];
        vm.chipRole = null;
        vm.showMemberForm = showMemberForm;
        vm.memberSearchTextChange = onMemberSearchTextChange;
        vm.selectedMemberChange = selectedMemberChange;
        vm.memberChipAction = memberChipActionHandler;
        //$log.info(vm.allMembers);
        //$log.info(vm.membersChips);
        vm.filterSelected = true;
        //vm.rbOnChange = rbOnChangeHandler;
        vm.addMembersToGroup = addMembersToGroup;
        vm.removeMemberFromGroup = removeMemberFromGroup;
        vm.toggleMemberSortAsc = true;
        vm.selectedMembersAction = selectedMembersActionHandler;
        vm.filterMembersSearch = filterMembersSearch;

        activate();

        ////////////////

        function activate() {
        	$log.info("Activated " + $state.current.title + " view.");
          // $log.debug(selectedGroup);
          // $log.info(treeData);
        }

        function formActionHandler(action) {
          if (action == 'cancel'){

            $state.go('community');

          } else if (action == 'next') {

            //var index = (vm.selectedTab == vm.max) ? 0 : vm.selectedTab + 1;
            var index = Math.min(vm.selectedTab + 1, vm.max) ;
            vm.selectedTab = index;

          } else if (action == 'save'){

            var c = vm.groupData;
            var newGroup = {
              label: c.label,
              description: c.description
            };

            // $log.info(newGroup);
            var result = insertIntoArray(treeData, selectedGroup._id, newGroup);

            localStorageService.set('treeData', treeData);
            $state.go('community', {}, { reload: true });

          }
        }

        function profileFieldsActionHandler(action, option, ev){
          if (action == 'addField'){
            // var newIDNo = (vm.allProfileFields.length > 0) ? (vm.allProfileFields.length + 1) : 1;
            var profileFieldsModel = null;
            var label = (option && option.length > 0) ? option : '';

            if (vm.fieldSearchText && vm.fieldSearchText.length > 0){
              if (!vm.fieldType){
                $scope.communityForm.fieldType.$setDirty();
                $scope.communityForm.fieldType.$setValidity("fieldType", false);
                return;
              }

              // $log.info(vm.fieldId);

              // newIDNo = (vm.fieldId) ? vm.fieldId : newIDNo;
              var model = vm.fieldModel = String(vm.fieldSearchText).toLowerCase().replace(" ", "_");
              var isRequired = vm.fieldIsRequired = (!Boolean(vm.fieldIsRequired)) ? false : true;

              profileFieldsModel = {
                'type': vm.fieldType,
                'label': vm.fieldSearchText,
                'model': model,
                'is_required': isRequired,
                'is_default': false,
                'order': (vm.customProfileFields.length+1)
              };
              if (vm.fieldId) { profileFieldsModel._id = vm.fieldId; }

              vm.customProfileFields.push(profileFieldsModel);

              var element = _.find(vm.allProfileFields, {model: profileFieldsModel.model});
              if (!element){
                vm.allProfileFields.push(profileFieldsModel);
                element = _.find(vm.allProfileFields, {model: profileFieldsModel.model});

                // INSERT new profile field into PROFILES mongodb collection
                var data = $.param(JSON.stringify(profileFieldsModel));
                vm.assignedProfileFieldsPromise = DataService.saveProfileFieldData(data);
                vm.assignedProfileFieldsPromise.success(function(result){
                  // success
                  // $log.info(result);

                  // update group.profile_fields data
                  // updateProfileFields(vm.customProfileFields, selectedGroup._id);

                }).error(function(result){
                  // error
                  $log.error(result);
                });
              } else {
              }
              element.is_assigned = true;

              // update group.profile_fields data
              vm.assignedProfileFieldsPromise = updateProfileFields(vm.customProfileFields, selectedGroup._id);

              //reset profile field contents
              vm.fieldId = null;
              vm.fieldType = vm.types[0].name;
              vm.fieldModel = null;
              vm.fieldIsRequired = false;
              vm.fieldSearchText = '';
              vm.selectedField = undefined;
            } else {
              $mdDialog.show(
                $mdDialog.alert()
                  .clickOutsideToClose(true)
                  .textContent("You need to input or select a custom field first!")
                  .ariaLabel('Alert Dialog')
                  .ok('Ok')
                  .targetEvent(ev)
              );
            }

          } else if (action == 'removeField'){

              var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to remove this field?')
                    .htmlContent(' - Field label:  <strong>'+option.label+'</strong> <br />'+' - Field type:  <strong>'+option.type+'</strong>')
                    .ariaLabel('Remove field')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');

              $mdDialog.show(confirm).then(function() {
                //vm.selectedMembers.splice(vm.selectedMembers.indexOf(member), 1);
                _.remove(vm.customProfileFields, {_id: option._id});

                var element = _.find(vm.allProfileFields, {model: option.model});
                element.is_assigned = false;

                // update group.profile_fields data
                vm.assignedProfileFieldsPromise = updateProfileFields(vm.customProfileFields, selectedGroup._id);

              }, function() {
                $log.debug('Deletion of: ' +option.label+ ' has been cancelled.');
              });

          } else if (action == 'toggleRequired'){

            var cboxElement = _.find(vm.customProfileFields, {_id: option});
            _.map(vm.customProfileFields, function(obj){
              if(obj._id==option) {
                is_required: !cboxElement.is_required;
              }
            });

          } else if (action == 'addNewField'){

            if (vm.fieldSearchText && vm.fieldSearchText.length > 0){
              var newFieldName = String(vm.fieldSearchText);
              vm.toggleReadOnly = false;

              vm.fieldId = null;
              vm.fieldType = vm.types[0].name;
              vm.fieldModel = newFieldName.toLowerCase().replace(" ", "_");
              vm.fieldIsRequired = false;
            }

          }
        }

        function selectedFieldChangeHandler (item, idx, $event) {
          //update vm.customProfileFields
          // $log.info(item);
          if (item) {
            if ($filter('filter')(vm.customProfileFields, function (d) { return d.label === item.label; })[0]) {
              $log.info('Item already selected. Will not add it again.');
            } else {
              vm.toggleReadOnly = true;

              vm.fieldId = item._id;
              vm.fieldType = item.type;
              vm.fieldModel = item.model;
              vm.fieldIsRequired = Boolean(item.is_required);
            }
            var ac = document.querySelector("md-autocomplete #profileFieldsAC");
            ac.blur();
          } else {
            vm.toggleReadOnly = false;
          }
        }

        function memberChipActionHandler(action, chip, idx){
          if (action == 'select'){
            //$log.info(chip.id);
            vm.selectedChip = chip;
            //vm.chipRole = chip.role;
          }
        }

        function addMembersToGroup (ev) {
          var deferred = $q.defer();

          $timeout(function() {

            if (vm.membersChips.length > 0){

              var assigned = _.map(vm.membersChips, function (m, index) {
                var member = {
                  $$hashKey: m.$$hashKey,
                  _id: m._id,
                  email_address: m.email_address,
                  mobile_number: m.mobile_number,
                  is_assigned: true,
                  role_group: [''],
                  roles: ''
                };
                if (m.role_group && m.role_group.length > 0) {
                  member.role_group = m.role_group;
                  member.roles = m.role_group.join(", ");
                } else {
                  member.role_group = ['member'];
                  member.roles = 'member';
                }
                member['is_complete'] = (m.profiles.length -2) >= vm.groupData.profile_fields.length;
                return member;
              });

              var updatedArr = _.forEach(assigned, function(value, key) {
                var element = _.find(vm.allMembers, {_id: value._id});
                element.is_assigned = true;
              });

              if (vm.selectedMembers.length > 0){
                vm.selectedMembers = vm.selectedMembers.concat(assigned);
                //vm.selectedMembers.concat(vm.membersChips);
              } else {
                vm.selectedMembers = assigned; // vm.membersChips;
              }

              var relationshipsArr = getRelationshipsArray();

              // update Group.relationships array
              DataService.saveGroupData('update', { relationships: relationshipsArr }, selectedGroup._id)
              .then(function (result) {
                deferred.resolve(result);

                // todo: add Group._id to User.groups

              }, function (err) {
                $log.error("Update group data, Error: " + err);
                deferred.reject('rejected');
              });

              vm.membersChips=[];

            } else {
              deferred.reject('rejected');

              $mdDialog.show(
                $mdDialog.alert()
                  .clickOutsideToClose(true)
                  .textContent("You need to input a member's email first!")
                  .ariaLabel('Alert Dialog')
                  .ok('Ok')
                  .targetEvent(ev)
              );
            }
          }, 500);

          return deferred.promise;
        }

        function removeMemberFromGroup (member, ev) {
          var confirm = $mdDialog.confirm()
                .title("Are you sure you want to remove this member?")
                .htmlContent(' - Email address:  <strong>'+member.email_address+'</strong> <br />'+' - Mobile number:  <strong>'+member.mobile_number+'</strong>')
                .ariaLabel('Remove member')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');

          $mdDialog.show(confirm).then(function() {
            vm.assignedMembersPromise = asyncRemoveMemberFromGroup(member);
          }, function() {
            $log.debug('Deletion of: ' +member.email_address+ ' has been cancelled.');
          });
        }

        function asyncRemoveMemberFromGroup (member) {
          var deferred = $q.defer();

          $timeout(function() {
            vm.selectedMembers.splice(vm.selectedMembers.indexOf(member), 1);

            var updatedArr = _.forEach(member, function(value, key) {
              var element = _.find(vm.allMembers, {_id: value});
              if (typeof element !== 'undefined'){
                element.is_assigned = false;
              }
            });

            var relationshipsArr = getRelationshipsArray();
            // $log.debug(relationshipsArr);

            // update Group.relationships array
            DataService.saveGroupData('update', { relationships: relationshipsArr }, selectedGroup._id)
            .then(function (result) {
              deferred.resolve(result);
            }, function (err) {
              $log.error("Update group data, Error: " + err);
              deferred.reject('rejected');
            });
          }, 500);

          return deferred.promise;
        }

        function getRelationshipsArray () {
          var relationshipsArr = [];

          // forEach memberdata in vm.selectedMembers
          _.forEach(vm.selectedMembers, function (member, key){
            if (member.role_group && member.role_group.length > 0){
              // forEach role in role_group
              _.forEach(member.role_group, function (role){
                var relationshipsObj = {
                  role_group: '',
                  values: []
                };

                // check if role already exists in relationships
                var item = _.find(relationshipsArr, {role_group: role});
                if (!item){
                  // if none, relationships.push
                  relationshipsObj.role_group = role;
                  relationshipsObj.values.push(member._id);

                  relationshipsArr.push(relationshipsObj);
                } else {
                  // if exists, relationships.values.push
                  item.values.push(member._id);
                }
              });
            }
          });

          return relationshipsArr;
        }

        function selectedMembersActionHandler (action, ev) {
          if (action == 'toggle-sort'){
            vm.toggleMemberSortAsc = !vm.toggleMemberSortAsc;
          }
        }

        function selectedFieldsActionHandler (action, ev) {
          if (action == 'toggle-sort'){
            vm.toggleFieldSortAsc = !vm.toggleFieldSortAsc;
          }
        }

        function dndListHandler (action, list, index, ev) {
          if (action && action.length > 0){
            if (action == 'onDragStart'){
              /*list.dragging = true;*/
            } else if (action == 'onDragEnd'){

              var updatedList = _.map(list, function(f, idx){
                var model = f;
                model.order = (idx+1);
                return model;
              });
              vm.customProfileFields = updatedList;

              vm.assignedProfileFieldsPromise = updateProfileFields(updatedList, selectedGroup._id);

            } else if (action == 'onMoved'){
              //list.items = list.filter(function(item) { return !item.selected; });
            }
          }
        }

        function dndListOnDrop (list, items, idx) {
          //angular.forEach(items, function(item) { item.selected = false; });
          /*list = list.slice(0, idx)
                      .concat(items)
                      .concat(list.slice(idx));
          return true;*/
          // vm.customProfileFields.splice(idx, 1);
        }

        function getSelectedItemsIncluding (list, item) {
          item.selected = true;
          return list.filter(function(item) { return item.selected; });
        }
        $scope.$watch('vm.customProfileFields', function(field) {
            // vm.proFields = angular.toJson(field, true);
            vm.proFieldsArr = _.map(field, function(f){
              var model = { fieldid: f._id, order: f.order };
              return model;
            });
        }, true);

        function updateProfileFields(updatedArray, groupId){
          var deferred = $q.defer();

          $timeout(function() {
            var proFieldsArr = _.map(updatedArray, function(f){
              var model = {
                fieldid: f._id,
                order: f.order
              };
              return model;
            });

            // update group.profile_fields data
            DataService.saveGroupData('update', { profile_fields: proFieldsArr }, groupId)
            .then(function (result) {
              //$log.info(result);
              deferred.resolve(result);
            }, function (err) {
              $log.error("Update group data, Error: " + err);
              deferred.reject(err);
            });

          }, 300);

          return deferred.promise;
        }

        function loadGroupData (key, value) {
            DataService.getGroupData(key, value).then(function (result) {

              //localStorageService.set('groupData', result.data);
              vm.groupData = result.data[0];

              vm.assignedMembersPromise = loadGroupMembers(vm.groupData);
              vm.assignedProfileFieldsPromise = loadGroupProfileFields(vm.groupData.profile_fields);

            }, function (result) {
              $log.error("Group data not available, Error: " + result);
            });
        }

        function loadGroupMembers (groupData) {
          var deferred = $q.defer();

          $timeout(function() {
              var assignedMemberIds = [];
              var assignedMembers;
              var memberObj = [];
              var relationships = groupData.relationships;
              var profile_fields = groupData.profile_fields;

              if (relationships && relationships.length > 0){
                _.forEach(relationships, function (value, key){
                  if (value.values && value.values.length > 0){
                    // for each userid in value.values
                    _.forEach(value.values, function (userid){

                      // check if userid is already inserted into assignedMemberIds[]
                      if (assignedMemberIds.indexOf(userid) < 0){
                        assignedMemberIds.push(userid);
                        var model = { _id: userid, role_group: [value.role_group] };
                        memberObj.push(model);
                      } else {
                        var member = _.find(memberObj, {_id: userid});
                        if (member){
                          member.role_group.push(value.role_group);
                        }
                      }
                    });
                  }
                });

                DataService.getUserData('id', assignedMemberIds.toString())
                .then(function (users) {

                  assignedMembers = users.data.map(function (u, idx){
                    var member = _.find(memberObj, {_id: u._id});

                    if (member){
                      // transform assignedMembers[] using memberModel obj
                      var memberModel = {
                        _id: u._id,
                        role_group: member.role_group,
                        roles: member.role_group.join(", "),
                        is_assigned: true
                      };
                      memberModel['is_complete'] = (u.profiles.length -2) >= profile_fields.length;

                      _.forEach(u.profiles, function(value, key) {
                        var profileKey = value['model'];
                        var profileValue = Array.isArray(value.value) ? value['value'].join(", ") : value['value'];
                        memberModel[profileKey] = profileValue; //.toString()
                      });

                      return memberModel;
                    }
                  });

                  var updatedArr = _.forEach(assignedMembers, function(value, key) {
                    var element = _.find(vm.allMembers, {_id: value._id});
                    if (element){ element.is_assigned = true; }
                  });
                  // merge/push assignedMembers[] into vm.selectedMembers
                  vm.selectedMembers = assignedMembers;
                  // console.log('vm.selectedMembers',vm.selectedMembers);

                  deferred.resolve(users);
                }, function (err) {
                  $log.error("User data not available, Error: " + err);
                  deferred.reject(err);
                });
              } else {deferred.reject('no results');}

          }, 500);

          return deferred.promise;
        }

        function loadGroupProfileFields (profile_fields) {
          var deferred = $q.defer();

          $timeout(function() {
              var assignedProfileFieldIds = [];

              if (profile_fields && profile_fields.length > 0){
                // for each field in vm.groupData.profile_fields
                _.forEach(profile_fields, function (field, key){
                  if (field){
                    // check if fieldId is already inserted into assignedProfileFieldIds[]
                    if (assignedProfileFieldIds.indexOf(field.fieldid) < 0){

                      // todo: find other way to load all assigned group profile fields in their correct order in one request
                      DataService.getProfileFieldData('id', field.fieldid)
                      .then(function (fields) {
                        // $log.debug(fields.data[0]);
                        if (!fields.data[0].is_default){

                          var fieldData = _.map(fields.data, function(fObj){
                            var fmodel = fObj;
                            fmodel.order = field.order;

                            return fmodel;
                          });
                          // $log.debug(fieldData[0]);
                          vm.customProfileFields.push(fieldData[0]);
                        }

                        assignedProfileFieldIds.push(field.fieldid);
                        var element = _.find(vm.allProfileFields, {_id: field.fieldid});
                        if (element){ element.is_assigned = true; }

                        vm.addMemberDisabled = false;

                        deferred.resolve(fields);
                      }, function (err) {
                        $log.error("Profile field data not available, Error: " + err);
                        vm.addMemberDisabled = true;
                        deferred.reject(err);
                      });
                    }

                  }
                });
              } else { deferred.reject('no results'); }

          }, 500);

          return deferred.promise;
        }

        function loadMemberFields(){
          //if (action == 'add'){
            //if (memberFieldsData == null) {
              DataService.getProfileFieldData().then(function (result) {
                //localStorageService.set('memberFieldsData', result.data);
                vm.allProfileFields = result.data;
                vm.defaultProfileFields = $filter('filter')(result.data, {is_default: true});
                //vm.customProfileFields = $filter(result.data, {is_default: false});
                //$log.debug(vm.customProfileFields);
              }, function (result) {
                $log.error("Profile fields not available, Error: " + result);
              });
            //} else {
              //vm.profileFields = memberFieldsData;
            //}
        }

        function updateTabs(tab) {
          if (tab == 'tab1'){
            if (vm.groupData.label && vm.groupData.label.length > 0){
              vm.step2locked = false;
              vm.btnNext1 = false;
              vm.step3locked = false;
              vm.btnNext2 = false;

              if (action == 'edit'){
                vm.dialogTitle = 'Edit Sub-Group: <strong>' + vm.groupData.label + '</strong>';
              }
            } else {
              vm.step2locked = true;
              vm.btnNext1 = true;
              vm.step3locked = true;
              vm.btnNext2 = true;
            }
          } else if (tab == 'tab2'){
            /*if ((vm.profileFields.email && vm.profileFields.email.length > 0) &&
                (vm.profileFields.mobileno && vm.profileFields.mobileno.length > 0)) {
            } else {
            }*/
          }
        }

        function onMemberSearchTextChange(text) {
          //$log.info('Text changed to ' + text);
        }

        function querySearch (collection, query) {
          var results;
          if (collection == 'members'){
            /*var results = query ? vm.allMembers.filter(createFilterFor(query)) : vm.allMembers;*/
            results = $filter('filter')(vm.allMembers, query);
            results = $filter('orderBy')(results, 'is_assigned');
            //$log.debug(JSON.stringify(results));

            return results.filter(function(member) {
              return (
                (angular.lowercase(member.email_address).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1 ||
                angular.lowercase(member.mobile_number).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1) &&
                vm.membersChips.indexOf(member) === -1
              );
              //return vm.membersChips.indexOf(item) === -1;
            });
          } else if (collection == 'profiles'){
            results = $filter('filter')(vm.allProfileFields, query);
            results = $filter('filter')(results, {is_default: false});
            results = $filter('orderBy')(results, 'is_assigned');

            //return results;

            return results.filter(function(field) {
              return (
                angular.lowercase(field.label).indexOf(angular.lowercase(vm.fieldSearchText) || '') !== -1 ||
                angular.lowercase(field.type).indexOf(angular.lowercase(vm.fieldSearchText) || '') !== -1
              );
            });
          }
        }
        /*$scope.$watchCollection('vm.membersChips', function() {
          if (typeof vm.allMembers != 'undefined')
            vm.allMembers = vm.querySearch('');
        });*/

        function filterFieldsSearch (field) {
          return (
            angular.lowercase(field.label).indexOf(angular.lowercase(vm.searchSelectedProfileFields) || '') !== -1 ||
            angular.lowercase(field.type).indexOf(angular.lowercase(vm.searchSelectedProfileFields) || '') !== -1
          );
        }

        function filterMembersSearch (member) {
          return (
            angular.lowercase(member.email_address).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1 ||
            angular.lowercase(member.mobile_number).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1
          );
        }

        function selectedMemberChange (item, ev) {
          if (item && item.is_assigned){
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title("Warning!")
                .textContent("You selected a user that is already assigned to the group. This user will not be added.")
                .ariaLabel('Alert Dialog')
                .ok('Ok')
                .targetEvent(ev)
            ).then(function() {
              vm.membersChips.pop();
            });
          }
        }

        function loadAllMembers() {
          vm.memberDataPromise = DataService.getUserData();
          vm.memberDataPromise.then(function (result) {
            //localStorageService.set('memberData', result.data);
            var memberData = result.data;

            vm.allMembers = memberData.map(function (m, index) {
              var member = {
                _id: m._id,
                is_assigned: false,
                profiles: m.profiles
              };
              _.forEach(m.profiles, function(value, key) {
                var profileKey = value['model'];
                var profileValue = Array.isArray(value.value) ? value['value'].join(", ") : value['value'];

                member[profileKey] = profileValue;
              });
              return member;
            });

          }, function (result) {
            $log.error("Member data not available, Error: " + result);
          });
        }

        function showMemberForm(mode, selectedMember, ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: 'MemberFormDialogCtrl',
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/member-form-dialog-tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
              bindToController: true,
              locals: { mode: mode, parent: vm, selectedMember: selectedMember }
          })
          .then(function(btnAction) {
            //saveMemberData($scope.member);

            // $scope.$apply();
            $state.reload();
            //vm.assignedMembersPromise = loadGroupMembers(vm.groupData.relationships);

            //$log.info('You clicked the "' + btnAction + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

        }


        function insertIntoArray(array, id, newChild) {
          if (typeof array != 'undefined') {
            for (var i = 0; i < array.length; i++) {
              if (array[i].id == id) {

                if (typeof array[i].children == 'undefined'){
                  var newArr = array[i];
                  newArr.children = [];
                  newChild.id = id + '.1';
                  newArr.children.push(newChild);

                  array[i] = newArr;
                } else {
                  var lastIdElem = array[i].children[array[i].children.length - 1].id;
                  var maxId = Number(lastIdElem.substr(lastIdElem.length-1, 1));
                  var newId = lastIdElem.substr(0, lastIdElem.length-1) + (maxId+1);

                  newChild.id = newId;
                  array[i].children.push(newChild);
                }

                return array[i];
              }
              var a = insertIntoArray(array[i].children, id, newChild);
              if (a !== null) {
                  return a;
              }
            }
          }
          return null;
        }

        MemberDialogCtrl.$inject = ['$scope', '$mdDialog'];
        /* @ngInject */
        function MemberDialogCtrl($scope, $mdDialog){
          $scope.dialogTitle = 'Add New Member';
          $scope.roles = $rootScope.stringToArr('1:Company Admin,2:Group Admin,3:Member');

          //$log.debug($scope.roles);

          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.action = function(action) {
            $mdDialog.hide(action);
          };
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app.community')
        .controller('MemberFormDialogCtrl', MemberFormDialogCtrl);

    MemberFormDialogCtrl.$inject = ['$scope', '$mdDialog', '$rootScope', 'localStorageService', '$log', 'DataService', 'mode', 'parent', 'selectedMember'];
    /* @ngInject */
    function MemberFormDialogCtrl($scope, $mdDialog, $rootScope, localStorageService, $log, DataService, mode, parent, selectedMember){
      var vm = this;

      vm.dialogTitle = ((mode == 'add') ? 'Create a New' : 'Edit') + ' Member';
      vm.mode = mode;

      vm.roles = [];

      vm.member = {
        role_group: [],
        profiles: {}
      };

      vm.isSaveDisabled = (mode == 'add') ? true : false;
      vm.selectConfig = {
        requiredMin: 1
      };

      //vm.formData = {};

      loadRoles();
      loadProfileFields();

      function loadRoles() {
        DataService.getRoleData().then(function(result){
          vm.roles = result.data;
          if (mode == 'add'){
            var element = _.find(vm.roles, {is_default: true});
            vm.member.role_group.push(element);
            vm.roles = filterOut(vm.roles, vm.member.role_group);

          } else if (mode == 'edit'){

            if (selectedMember){
              _.forEach(selectedMember.role_group, function (role) {
                var element = _.find(vm.roles, {rolekey: role});
                if (element) { vm.member.role_group.push(element); }
                vm.roles = filterOut(vm.roles, vm.member.role_group);
              });
            }

          }

        },function(err){
          $log.error("Role data not available, Error: " + err);
        });
      }

      function loadProfileFields () {
        // get data from vm.customProfileFields
        vm.profileFields = parent.customProfileFields;

        if (mode == 'add'){
          vm.member.profiles['email_address'] = selectedMember;
        } else if (mode == 'edit'){
          vm.member.profiles['email_address'] = selectedMember.email_address;
          vm.member.profiles['mobile_number'] = selectedMember.mobile_number;

          _.forEach(vm.profileFields, function (field) {
            if (field.model){
              if (field.type == 'number'){
                vm.member.profiles[field.model] = +selectedMember[field.model];
              } else {
                vm.member.profiles[field.model] = selectedMember[field.model];
              }
            }
          });
        }
      }

      function processFormHandler () {
        var relationships = [];
        var profiles = [];

        // transform vm.member.profiles
        // profiles = _.map(vm.member.profiles, function(value, key){
        //   if (value){
        //     var profileValue = (value.toString().indexOf(",") >= 0) ? value.replace(" ", "").split(",") : value;
        //     console.log('profileValue',profileValue);
        //     var model = {
        //       model: key,
        //       value: profileValue
        //     };
        //     return model;
        //   }
        // });
        _.forEach(vm.member.profiles, function(value, key){
          if (value){
            var profileValue = (value.toString().indexOf(",") >= 0) ? value.replace(" ", "").split(",") : value;
            var model = {
              model: key,
              value: profileValue
            };
            // return model;
            profiles.push(model);
          }
        });
        $log.info(profiles);

        // insert new member to Users collection
        var userModel = {
          profiles: profiles
        };
        //userModel.groups.push(parent.groupData._id);
        // $log.info(userModel);

        // save to Users collections and Groups.relationships
      	if (mode == 'add'){

          DataService.saveUserData('insert', userModel)
          .then(function (result) {
            // success
            var newId = result.data.newId;

            // insert new member into Groups.relationships
            relationships = getGrpRelationships(newId);

            DataService.saveGroupData('update', { relationships: relationships }, parent.groupData._id)
            .then(function (result) {

              parent.groupData.relationships = relationships;

              $mdDialog.hide(parent.groupData.relationships);
            }, function (err) {
              $log.error("Update group data, Error: " + err);
            });

          }, function (err) {
            // error
            $log.error("Insert user data, Error: " + err);
          });

        } else if (mode == 'edit'){
          //
          DataService.saveUserData('update', userModel, selectedMember._id)
          .then(function (result) {

            relationships = getGrpRelationships(selectedMember._id);

            DataService.saveGroupData('update', { relationships: relationships }, parent.groupData._id)
            .then(function (result) {

              parent.groupData.relationships = relationships;

              $mdDialog.hide(parent.groupData.relationships);
            }, function (err) {
              $log.error("Update group data, Error: " + err);
            });

          }, function (err) {
            // error
            $log.error("Update user data, Error: " + err);
          });
        }
      }

      $scope.$watch('memberForm.$valid', function(v) {
        vm.isSaveDisabled = !v;
      }, true);

      vm.validateInput = function(){
        if ((vm.member.profiles.email_address && vm.member.profiles.email_address.length > 0) &&
           (vm.member.profiles.mobile_number && vm.member.profiles.mobile_number.length > 0)){

          $scope.memberForm.email.$setValidity("invalid-email", true);
          $scope.memberForm.mobileno.$setValidity("invalid-mobileno", true);

          vm.isSaveDisabled = false;
        } else {
          vm.isSaveDisabled = true;
        }
      };


      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.action = function(action) {
        if (action == 'save'){
          if (validateMemberForm) {
            processFormHandler();
          }
        } else if (action == 'cancel'){
          $mdDialog.cancel();
        }
        // $mdDialog.hide(parent.groupData.relationships);
      };

      function filterOut(original, toFilter) {
        var filtered = [];
        angular.forEach(original, function(entity) {
          var match = false;
          for(var i = 0; i < toFilter.length; i++) {
            if(toFilter[i]['rolelabel'] == entity['rolelabel']) {
              match = true;
              break;
            }
          }
          if(!match) {
            filtered.push(entity);
          }
        });
        return filtered;
      }

      function getGrpRelationships (userId) {
        var relationships = [];

        // $log.debug(parent.groupData.relationships);
        relationships = parent.groupData.relationships;
        _.forEach(relationships, function(rel, key){
          _.forEach(vm.member.role_group, function (role) {
            if (role.rolekey == rel.role_group){
              if (rel.values.indexOf(userId) < 0){
                rel.values.push(userId);
              }
            } else if (role.rolekey != rel.role_group) {
              var element = _.find(relationships, {role_group: role.rolekey});
              if (!element) {
                var model = {
                  role_group: role.rolekey,
                  values: []
                };
                model['values'].push(userId);
                relationships.push(model);
              }
            }
          });
          _.forEach(vm.roles, function (role) {
            if (role.rolekey == rel.role_group){
              if (rel.values.indexOf(userId) >= 0){
                rel.values.splice(rel.values.indexOf(userId), 1);
              }
            }
          });
        });
        return relationships;
      }

      function validateMemberForm() {
        var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
        var MOBILENO_REGEXP = /^((\+63)|0)[.\- ]?9[0-9]{2}[.\- ]?[0-9]{3}[.\- ]?[0-9]{4}$/;
        var isValidEmail, isValidMobileNo;

        var profiles = _.map(vm.member.profiles, function(value, key){
          var profileValue = (value.toString().indexOf(",") >= 0) ? value.replace(" ", "").split(",") : value;

          if (key == 'email_address'){
            if (angular.isArray(profileValue)){
              _.forEach(profileValue, function (email) {
                // console.log('Email', email);
                isValidEmail = EMAIL_REGEXP.test(email);
              });
            } else {
              // console.log('Email', profileValue);
              isValidEmail = EMAIL_REGEXP.test(profileValue);
            }
            // console.log('isValidEmail', isValidEmail);

            if (!isValidEmail) {
              $scope.memberForm.email.$setValidity("invalid-email", false);
            }
          }

          if (key == 'mobile_number'){
            if (angular.isArray(profileValue)){
              _.forEach(profileValue, function (mobile) {
                // console.log('MobileNo', mobile);
                isValidMobileNo = MOBILENO_REGEXP.test(mobile);
              });
            } else {
              // console.log('MobileNo', profileValue);
              isValidMobileNo = MOBILENO_REGEXP.test(profileValue);
            }
            // console.log('isValidMobileNo', isValidMobileNo);

            if (!isValidMobileNo) {
              $scope.memberForm.mobileno.$setValidity("invalid-mobileno", false);
            }
          }
        });

        return (isValidEmail && isValidMobileNo);
      }

    }
})();

(function() {
    'use strict';

    angular
        .module('app.community')
        .directive('multiSelect', multiSelect);

    multiSelect.$inject = ['$q'];

    /* @ngInject */
    function multiSelect($q) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'E',
            scope: {
				      selectedLabel: "@",
				      availableLabel: "@",
				      displayAttr: "@",
				      available: "=",
				      model: "=ngModel",
				      config: "="
			    	},
			    	template: '<div class="multiSelect" layout="row">' + 
        '<div class="select" flex>' + 
          '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
              '({{ model.length }})</label>' +
          '<select id="currentRoles" ng-model="selected.current" multiple ' + 
              'class="pull-left" ng-options="e as e[displayAttr] for e in model">' + 
              '</select>' + 
        '</div>' + 
        '<div class="select buttons" flex="1">' + 
        	'<md-button class="md-fab md-mini btn mover left" ng-click="add()" title="Add selected" ng-disabled="selected.available.length == 0">' +
            '<i class="material-icons md-24">arrow_back</i>' +
            '<md-tooltip md-direction="top">Add selected</md-tooltip>' +
          '</md-button>' +
        	'<md-button class="md-fab md-mini btn mover right" ng-click="remove()" title="Remove selected" ng-disabled="selected.current.length == 0">' +
            '<i class="material-icons md-24">arrow_forward</i>' +
            '<md-tooltip md-direction="top">Remove selected</md-tooltip>' +
          '</md-button>' +
        '</div>' + 
        '<div class="select" flex>' +
          '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
              '({{ available.length }})</label>' +
          '<select id="multiSelectAvailable" ng-model="selected.available" multiple ' +
              'ng-options="e as e[displayAttr] for e in available"></select>' +
        '</div>' +
	      '<input type="number" name="numSelected" ng-model="numSelected" ' +
            'style="display: none">' +
      '</div>'
        };
        return directive;

        function link(scope, elm, attrs) {
			      scope.selected = {
			        available: [],
			        current: []
			      };

			      /* Handles cases where scope data hasn't been initialized yet */
			      var dataLoading = function(scopeAttr) {
			        var loading = $q.defer();
			        if(scope[scopeAttr]) {
			          loading.resolve(scope[scopeAttr]);
			        } else {
			          scope.$watch(scopeAttr, function(newValue, oldValue) {
			            if(newValue !== undefined)
			              loading.resolve(newValue);
			          });  
			        }
			        return loading.promise;
			      };

			      /* Filters out items in original that are also in toFilter. Compares by reference. */
			      var filterOut = function(original, toFilter) {
			        var filtered = [];
			        angular.forEach(original, function(entity) {
			          var match = false;
			          for(var i = 0; i < toFilter.length; i++) {
			            if(toFilter[i][attrs.displayAttr] == entity[attrs.displayAttr]) {
			              match = true;
			              break;
			            }
			          }
			          if(!match) {
			            filtered.push(entity);
			          }
			        });
			        return filtered;
			      };

			      var requiredMin, inputModel;
			      function ensureMinSelected() {
		          if(requiredMin && scope.model) {
		            scope.numSelected = scope.model.length;
		            inputModel.$setValidity('min', (scope.numSelected >= requiredMin));
		          }
		        }

			      scope.refreshAvailable = function() {
			      	if(scope.model && scope.available){
				        scope.available = filterOut(scope.available, scope.model);
				        scope.selected.available = [];
				        scope.selected.current = [];
				      }
			      }; 

			      scope.add = function() {
			        scope.model = scope.model.concat(scope.selected.available);
			        scope.refreshAvailable();
			      };
			      scope.remove = function() {
			        scope.available = scope.available.concat(scope.selected.current);
			        scope.model = filterOut(scope.model, scope.selected.current);
			        scope.refreshAvailable();
			      };

			      $q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
			        scope.refreshAvailable();
			      });

		        //Watching the model, updating if the model is a resolved promise
		        scope.watchModel = function(){
		          if(scope.model && scope.model.hasOwnProperty('$promise') && !scope.model.$resolved){
		            scope.model.then(function(results) {
		              scope.$watch('model', scope.watchModel);
		            });
		          }
		          else{
		            scope.refreshAvailable();
		            scope.$watch('model', scope.refreshAvailable);  
		          }
		        };
		        
		        //Watching the list of available items. Updating if it is a resolved promise, and refreshing the 
		        //available list if the list has changed
		        var _oldAvailable = {};
		        scope.watchAvailable = function(){
		          if(scope.available && scope.available.hasOwnProperty('$promise') && !scope.available.$resolved){
		            scope.available.$promise.then(function(results) {
		              scope.$watch('available', scope.watchAvailable);
		            });
		          }
		          else{
		            //We only want to refresh the list if the list of available items has changed
		            //and the variable is defined
		            if(scope.available && scope.available != _oldAvailable){
		              scope.refreshAvailable();
		              _oldAvailable = scope.available; 
		            }
		          }
		        };

		        scope.$watch("available", scope.watchAvailable);
		        scope.$watch("model", scope.watchModel);

						if(scope.config && angular.isDefined(scope.config.requiredMin)) {
		          var inputs = elm.find("input");
		          var validationInput = angular.element(inputs[inputs.length - 1]);
		          inputModel = validationInput.controller('ngModel');
		        }

						scope.$watch('config.requiredMin', function(value) {
		          if(angular.isDefined(value)) {
		            requiredMin = parseInt(value, 10);
			          // console.log("requiredMin: "+requiredMin);
		            ensureMinSelected();
		          }
		        });

		        scope.$watch('model.length', function(selected) {
		          ensureMinSelected();
		        });

        }
    }
    
})();
(function() {
    'use strict';

    angular
        .module('app.community')
        .factory('URLConfig', URLConfig);

    function URLConfig() {
        var service = {
            treeData: "app/api/treeData.json",
            roleData: "app/api/roleData.json",
            groupData: "app/api/groupData.json",
            memberData: "app/api/memberData.json",
            memberFieldsData: "app/api/memberFieldsData.json",
        };
        return service;
        ////////////////
        /*function func() {
        }*/
    }
})();
(function() {
    'use strict';

    angular
        .module('app.community')
        .controller('CommunityController', CommunityController);

    CommunityController.$inject = ['$rootScope', '$q', '$scope', '$mdDialog', '$mdMedia',
                                   '$log', 'DataService', '$state', 'localStorageService',
                                   '$timeout'];
    /* @ngInject */
    function CommunityController($rootScope, $q, $scope, $mdDialog, $mdMedia,
                                 $log, DataService, $state, localStorageService,
                                 $timeout) {
        var vm = this;
        var tree;
        vm.title = 'My Community';
        vm.isOpen = false;
        vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

        vm.ftbleft = {
          isOpen: false,
          selectedDirection: 'right',
          selectedMode: 'md-fling'
        };
        vm.ftbright = {
          isOpen: false,
          selectedDirection: 'left',
          selectedMode: 'md-fling'
        };

        vm.hasSelected = false;

        vm.showAddCommunity = showAddCommunity;
        vm.showUploadCommunity = showUploadCommunity;
        vm.showAddMember = showAddMember;
        vm.showMemberList = showMemberList;
        vm.showGroupDialog = showGroupDialog;

        /* tree controls */
        vm.initialSelection = '';
        vm.treeData = [];
        vm.treeDataPromise = angular.noop;
        vm.communityTree = tree = {};
        vm.treeHandler = treeHandler;
        vm.subGroupAction = subGroupActionHandler;
        vm.searchTreeHandler = searchTreeHandler;

        //localStorageService.clearAll();
        //vm.treeData = (localStorageService.get('treeData') != null) && localStorageService.get('treeData');
        //vm.updateGroupIcon = '../images/icons/ic_border_color_black_24px.svg';

        vm.groupData = [];
        loadGroupData();
        activate();

        ////////////////
        function activate() {
          $log.info('Activated My Community View');
          //$log.debug('localStorageService.isSupported: ' + localStorageService.isSupported);
        }

        function loadGroupData () {
            vm.treeDataPromise = DataService.getGroupData();
            vm.treeDataPromise.then(function (result) {

              //localStorageService.set('groupData', result.data);
              vm.groupData = result.data;
              $log.info(vm.groupData);
              buildTree();
            }, function (result) {
              $log.error("Group data not available, Error: " + result);
            });
        }

        function buildTree() {
          var level = 1;
          var group = _.filter(vm.groupData, {
            level: level
          });
          var tree = [{
            _id: Number(group[0]._id),
            label: group[0].label,
            description: group[0].description,
            level: group[0].level,
            relationships: group[0].relationships,
            profile_fields: group[0].profile_fields,
            data: { compAdminCount: 0, grpModCount: 0, memberCount: 0 },
            children: []
          }];
          if (group[0].relationships.length > 0){
            _.forEach(group[0].relationships, function (member) {
              if (member.role_group == 'company_admin') tree[0].data['compAdminCount'] = member.values.length;
              if (member.role_group == 'group_moderator') tree[0].data['grpModCount'] = member.values.length;
              if (member.role_group == 'member') tree[0].data['memberCount'] = member.values.length;
            });
          }

          var model = {};
          var obj = {};

          while (group && group.length > 0) {
            level += 1;
            group = _.filter(vm.groupData, {
              level: level
            });
            _.forEach(group, function(g) {
              model = {
                _id: g._id,
                label: g.label,
                description: g.description,
                level: g.level,
                relationships: g.relationships,
                profile_fields: g.profile_fields,
                data: { compAdminCount: 0, grpModCount: 0, memberCount: 0 },
                children: []
              };
              if (g.relationships.length > 0){
                _.forEach(g.relationships, function (member) {
                  if (member.role_group == 'company_admin') model.data['compAdminCount'] = member.values.length;
                  if (member.role_group == 'group_moderator') model.data['grpModCount'] = member.values.length;
                  if (member.role_group == 'member') model.data['memberCount'] = member.values.length;
                });
              }

              forEachBr(tree, function(t) {
                if (t._id == Number(g.parentid)){
                  t.children.push(model);
                }
              });
            });
          }
          vm.treeData = tree;
          // console.log('vm.treeData',vm.treeData);
          // if (localStorageService.get('treeData') == null) {
          //   vm.treeDataPromise = MyCommunityService.getTreeData();
          //   vm.treeDataPromise.then(function (result) {
          //     //vm.treeData = result.data;

          //     localStorageService.set('treeData', result.data);
          //     vm.treeData = result.data;
          //   }, function (result) {
          //     $log.error("Tree not available, Error: " + result);
          //   });
          // } else {
          //   vm.treeData = localStorageService.get('treeData');
          // }
          if (vm.treeData[0]){
            vm.initialSelection = vm.treeData[0].label;
          }
        }

        function searchTreeHandler(text, e){
          var t = vm.treeData;

          if (text.length > 0){
            forEachBr(vm.treeData, function(t) {
              if (t.label.toLowerCase().startsWith(text.toLowerCase())){
                $timeout(function() {
                  vm.communityTree.select_branch(t);
                });
              }
            });
          } else {
            vm.communityTree.select_branch(-1);
            vm.communityTree.collapse_all();
          }

        }

        function treeHandler(branch) {
          var _ref;
          //$log.info(branch);

          vm.hasSelected = true;
          vm.selectedCompany = branch;
          //if ((_ref = branch.data) != null ? _ref.description : void 0) {
            //vm.selectedCompanyDesc = branch.data.description;
            //return vm.selectedCompanyDesc += '(' + branch.data.description + ')';
          //} else {
            //vm.selectedCompanyDesc = "";
          //}
          //$log.debug(branch);
        }

        function subGroupActionHandler(action, ev, showTab) {
          var b = vm.communityTree.get_selected_branch();

          if (vm.hasSelected){
            if ((action == 'add') || (action == 'edit')){
              $state.go('community.form',{action: action, groupObj: b, showTab: showTab});
            } else { // delete
              var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to delete ' + b.label + '?')
                    .textContent('Warning: \r\nThis group and all its sub-groups will be deleted. \r\nThis action can\'t be undone.')
                    .ariaLabel('Remove Sub Group')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');

              if (b.label == vm.treeData[0].label){
                showAlert('Cannot delete the top-most group.',
                    'Remove Sub Group Dialog', ev);
              } else {
                $mdDialog.show(confirm).then(function() {
                  // delete selected group and its sub-groups from Groups collection
                  var subs = [];
                  subs = getSubBranches (b, vm.communityTree, subs);
                  // $log.debug(subs);

                  // get all sub-group ids
                  var subIds = '';
                  if (subs){
                    if (subs.length > 0){
                      subIds = b._id + ',';
                      _.times(subs.length, function(i) {
                        if (i == subs.length-1){
                          subIds += subs[i]._id;
                        } else {
                          subIds += subs[i]._id + ',';
                        }
                      });
                    }
                  } else { subIds = b._id; }
                  // $log.info(subIds);

                  vm.treeDataPromise = DataService.deleteGroupData(subIds);
                  vm.treeDataPromise.then(function (result) {
                    $log.debug('Deleted: ' + b.label);

                    // delete selected group and its sub-groups from treeview
                    deleteSubArray(vm.treeData, b._id);

                    //save the updated treeData to localstorage
                    //localStorageService.set('treeData', vm.treeData);
                  }, function (result) {
                    $log.error("Error on deletion of group data, Error: " + result);
                  });
                }, function() {
                  $log.debug('Deletion of: ' + b.label + ' has been cancelled.');
                });
              }
            }

          } else {
            var dTitle = (action == 'add') ? 'Add' : ((action == 'edit') ? 'Edit' : 'Remove');
            showAlert('Please select a group from the TreeView.',
                  dTitle+' Sub-Group Dialog', ev);
          }

        }

        function showAlert(title, ariaLabel, ev){
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title(title)
              .ariaLabel(ariaLabel)
              .ok('Ok')
              .targetEvent(ev)
          );
        }

        function showAddCommunity(ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: CommunityFormDialogCtrl,
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/community-form-dialog-tmpl.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            $log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

          /*$scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
          }, function(wantsFullScreen) {
            vm.customFullscreen = (wantsFullScreen === true);
          });*/

        }

        function showUploadCommunity(ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: CommunityUploadDialogCtrl,
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/community-upload-dialog-tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            $log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

          /*$scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
          }, function(wantsFullScreen) {
            vm.customFullscreen = (wantsFullScreen === true);
          });*/
        }

        function showAddMember(ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: 'MemberFormDialogCtrl',
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/member-form-dialog-tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            //saveMemberData($scope.member);
            //$log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

        }
        function saveMemberData(action, content, id){
          DataService.saveUserData(action, content, id).then(function (result) {
            $log.info('Member data saved.');
            // $log.info(result);
          }, function (result) {
            $log.error("Cannot save member data, Error: " + result);
          });
        }

        function showGroupDialog (mode, ev) {
          if (vm.hasSelected){
            $mdDialog.show({
                controller: GroupFormDialogCtrl,
                controllerAs: 'vm',
                templateUrl: 'app/mycommunity/group-form-dialog.tmpl.html',
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: { mode: mode }
            })
            .then(function(action) {
              //saveMemberData($scope.member);
              $log.info('You clicked the "' + action + '" button.');
            }, function() {
              $log.info('You cancelled the dialog.');
            });
          } else {
            showAlert('Please select a group from the TreeView.',
                  'Add Sub-Group Dialog', ev);
          }
        }

        function showMemberList(ev){
          $mdDialog.show({
              controller: MemberListDialogCtrl,
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/member-list.tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            $log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });
        }

        CommunityUploadDialogCtrl.$inject = ['$scope', '$mdDialog'];
        /* @ngInject */
        function CommunityUploadDialogCtrl($scope, $mdDialog){
          $scope.dialogTitle = 'Add New Community';
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.action = function(action) {
            $mdDialog.hide(action);
          };
        }

        MemberListDialogCtrl.$inject = ['$scope', '$mdDialog'];
        /* @ngInject */
        function MemberListDialogCtrl($scope, $mdDialog){
          $scope.dialogTitle = 'List of Members';
          $scope.searchText = "";

          fetchMembers();

          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.action = function(action) {
            $mdDialog.hide(action);
          };

          function fetchMembers(){
              DataService.getUserData().then(function (result) {
                //$log.debug(result);
                $scope.memberData = result.data;
              }, function (result) {
                $log.error("Member data not available, Error: " + result);
              });
          }
        }

        GroupFormDialogCtrl.$inject = ['$scope', '$mdDialog', 'mode'];
        /* @ngInject */
        function GroupFormDialogCtrl($scope, $mdDialog, mode){
          $scope.dialogTitle = ((mode == 'add') ? 'Add New' : 'Edit') + ' Sub-Group';

          var selectedBranch = vm.communityTree.get_selected_branch();
          //var parentBranch = selectedBranch.select_parent_branch();
          // $log.info(selectedBranch);

          $scope.isSaveDisabled = true;
          $scope.mode = mode;

          if (mode == 'edit'){
            $scope.groupLabel = selectedBranch.label;
            $scope.groupDescription = selectedBranch.description;
            $scope.isSaveDisabled = false;
          }

          $scope.validateGroupForm = function(){
            if ($scope.groupLabel && $scope.groupLabel.length > 0){
              $scope.isSaveDisabled = false;
            } else {
              $scope.isSaveDisabled = true;
            }
          };

          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.action = function(action) {
            if (action == 'save'){
              var grpModel = {
                label: $scope.groupLabel,
                description: $scope.groupDescription
              };

              if (mode == 'add'){
                grpModel.level = Number(selectedBranch.level) + 1;
                grpModel.parentid = selectedBranch._id;
                grpModel.relationships = [];
                grpModel.profile_fields = [];

                insertSubGroup(grpModel);

              } else if (mode == 'edit'){
                grpModel.level = +selectedBranch.level;
                grpModel.parentid = selectedBranch._id;
                grpModel.relationships = selectedBranch.relationships;
                grpModel.profile_fields = selectedBranch.profile_fields;

                // console.log('selectedBranch.relationships',selectedBranch.relationships);
                // console.log('selectedBranch.profile_fields',selectedBranch.profile_fields);

                updateSubGroup(grpModel, selectedBranch._id);

              }

            }
            $mdDialog.hide(action);
          };

          function insertSubGroup(model) {
            vm.treeDataPromise = DataService.saveGroupData('insert', model);
            vm.treeDataPromise.then(function (result) {

              vm.communityTree.add_branch(selectedBranch, {
                _id: result.data.newId,
                label: $scope.groupLabel,
                description: $scope.groupDescription,
                level: model.level
              });

              // focus on the created sub-group
              searchTreeHandler($scope.groupLabel);
            }, function (result) {
              $log.error("Error on insertion of group data, Error: " + result);
            });
          }

          function updateSubGroup(model, id) {
            vm.treeDataPromise = DataService.saveGroupData('update', model, id);
            vm.treeDataPromise.then(function (result) {

              forEachBr(vm.treeData, function(t) {
                if (t._id == id){
                  t.label = $scope.groupLabel;
                  t.description = $scope.groupDescription;
                }
              });

              // focus on the created sub-group
              //searchTreeHandler($scope.groupLabel);
            }, function (result) {
              $log.error("Error on update of group data, Error: " + result);
            });
          }
        }

        function deleteSubArray(array, id, parent) {
          if (typeof array != 'undefined') {
            for (var i = 0; i < array.length; i++) {
              if (array[i]._id == id) {

                if (typeof array[i].children != 'undefined'){
                  parent.children.splice(i,1);
                  break;
                }

                return array[i];
              }
              var a = deleteSubArray(array[i].children, id, array[i]);
              if (a !== null) {
                  return a;
              }
            }
          }
          return null;
        }

        function getSubBranches (b, tree, s) {
          var next;
          var subs = s;

          if (b !== null) {
            next = tree.get_first_child(b);
            if (next !== null) {
              subs.push(next);
              return getSubBranches(next, tree, subs);
            } else {
              if (subs.length > 0){
                next = tree.get_next_sibling(b);
                if (next !== null) {
                  subs.push(next);
                  return getSubBranches(next, tree, subs);
                } else {
                  return subs;
                }
              }
            }
          } else {
            return subs;
          }
        }

        function forEachBr (treeObj, f) {
          var do_f, root_branch, _i, _len, _ref, _results;
          do_f = function(branch, level) {
            var child, _i, _len, _ref, _results;
            f(branch, level);
            if (branch.children !== null) {
              _ref = branch.children;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(do_f(child, level + 1));
              }
              return _results;
            }
          };
          _ref = treeObj;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            root_branch = _ref[_i];
            _results.push(do_f(root_branch, 1));
          }
          return _results;
        }
    }
})();

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

(function() {
    'use strict';

    angular
      .module('app.community')
      .directive('ngFile', ngFile);

    ngFile.$inject = ['$parse'];

    /* @ngInject */
    function ngFile($parse) {
      // Usage:
      //
      // Creates:
      //
      var directive = {
          link: link,
          restrict: 'A'
      };
      return directive;

      function link(scope, element, attrs) {
        var model = $parse(attrs.ngFile);
        var modelSetter = model.assign;

        element.bind('change', function() {
          scope.$apply(function() {
              modelSetter(scope, element[0].files);
          });
        });
      }
    }

})();
(function() {
    'use strict';
    
    angular
        .module('app.services', [
            'app.core'
        ]);
})();
(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('MessagePreviewDialogCtrl', MessagePreviewDialogCtrl);

    MessagePreviewDialogCtrl.$inject = ['$scope', '$mdDialog', '$rootScope', '$log', 'mode', 'parent'];
    
    /* @ngInject */
    function MessagePreviewDialogCtrl($scope, $mdDialog, $rootScope, $log, mode, parent) {
        var vm = this;

	      vm.dialogTitle = 'Message Preview';
	      vm.mode = mode;

	      vm.messageDetailsModel = []; 
			  vm.query = {
			    order: 'network',
			    limit: 5,
			    page: 1
			  };

			  vm.messageDetails = [
			  	{ network: 'SMART', recipients: 1, characters: 100, sms: 1 },
			  	{ network: 'GLOBE', recipients: 0, characters: 0, sms: 0 },
			  	{ network: 'SUN', recipients: 0, characters: 0, sms: 0 }
			  ];

        ////////////////

	      $scope.hide = function() {
	        $mdDialog.hide(); 
	      };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

	      $scope.action = function(action) {
	        if (action == 'send'){
	        	// send message to recipients

	        } else if (action == 'cancel'){
	          $mdDialog.cancel();
	        }
	      };

    }
})();
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

(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('ScheduleSMSDialogCtrl', ScheduleSMSDialogCtrl);

    ScheduleSMSDialogCtrl.$inject = ['$scope', '$mdDialog', '$rootScope', '$log', 'mode', 'parent'];
    
    /* @ngInject */
    function ScheduleSMSDialogCtrl($scope, $mdDialog, $rootScope, $log, mode, parent) {
        var vm = this;

	      vm.dialogTitle = 'Schedule Your Text Message For Later Delivery'; 
	      vm.mode = mode;

        ////////////////

	      $scope.hide = function() {
	        $mdDialog.hide(); 
	      };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

	      $scope.action = function(action) {
	        if (action == 'schedule'){
	        	// schedule message for later delivery

	        } else if (action == 'cancel'){
	          $mdDialog.cancel();
	        }
	      };

    }
})();
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
(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('BroadcastController', BroadcastController);

    BroadcastController.$inject = ['$q', '$scope', '$log', '$mdDialog', '$timeout'];

    /* @ngInject */
    function BroadcastController($q, $scope, $log, $mdDialog, $timeout) {
        var vm = this;
        vm.title = 'My Services - Broadcast';
        vm.isOpen = false;

        vm.message = {
          contacts: [],
          sendername: null,
          body: null,
          optout: null
        };

        vm.senderNames = [
          {
            key: 'sample_sender_name',
            value: 'Sample Sender Name'
          },
          {
            key: 'smart_communications',
            value: 'Smart Communications'
          }
        ];

        // Contacts Chip handlers
        vm.contactsChipAction = contactsChipActionHandler;
        vm.selectedContactChange = onSelectedContactChange;
        vm.contactSearchTextChange = onContactSearchTextChange;
        vm.querySearch = onQuerySearch;

        vm.showMessagePreview = showMessagePreview;

        activate();

        ////////////////

        function activate() {
          $log.info('Activated My Services - Broadcast View');

          // loadGroups();
          // loadUsers();
        }

        function contactsChipActionHandler(action, chip, idx) {
          if (action === 'select'){
            vm.selectedChip = chip;
          }
        }

        function onSelectedContactChange (item, ev) {
          if (item && item.is_assigned){
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Warning!')
                .textContent('You selected a user that is already assigned as recipient. This user will not be added.')
                .ariaLabel('Alert Dialog')
                .ok('Ok')
                .targetEvent(ev)
            ).then(function() {
              vm.message.contacts.pop();
            });
          }
        }

        function onContactSearchTextChange(text) {
          // body...
        }

        function onQuerySearch(query) {
          // var results = $filter('filter')(vm.allMembers, query);
          // results = $filter('orderBy')(results, 'is_assigned');

          // return results.filter(function(member) {
          //   return (
          //     (angular.lowercase(member.email_address).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1 ||
          //     angular.lowercase(member.mobile_number).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1) &&
          //     vm.membersChips.indexOf(member) === -1
          //   );
          // });
        }

        function showMessagePreview (mode, ev) {
          switch (mode) {
            case 'later':
              $mdDialog.show({
                  controller: 'ScheduleSMSDialogCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'app/myservices/schedule-sms-dialog-tmpl.html',
                  targetEvent: ev,
                  clickOutsideToClose:true,
                  bindToController: true,
                  locals: { mode: mode, parent: vm }
              })
              .then(function(btnAction) {
                //$state.reload();

                //$log.info('You clicked the "' + btnAction + '" button.');
              }, function() {
                $log.info('You cancelled the dialog.');
              });
              break;

            case 'bulk':
              break;

            default:
              $mdDialog.show({
                  controller: 'MessagePreviewDialogCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'app/myservices/message-preview-dialog-tmpl.html',
                  targetEvent: ev,
                  clickOutsideToClose:true,
                  bindToController: true,
                  locals: { mode: mode, parent: vm }
              })
              .then(function(btnAction) {
                //$state.reload();

                //$log.info('You clicked the "' + btnAction + '" button.');
              }, function() {
                $log.info('You cancelled the dialog.');
              });
              break;
          }
        }

    }
})();

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
(function() {
    'use strict';
    
    angular
        .module('app.servicesStore', [
            'app.core'
        ]);
})();
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

angular.module("app.core").run(["$templateCache", function($templateCache) {$templateCache.put("app/core/404.html","<section id=dashboard-view class=mainbar><section class=matter><div class=container><div class=row><div class=col-md-12><ul class=today-datas><li class=bred><div class=pull-left><i class=\"fa fa-warning\"></i></div><div class=\"datas-text pull-right\"><a><span class=bold>404</span></a>Page Not Found</div><div class=clearfix></div></li></ul></div></div><div class=row><div class=\"widget wblue\"><div ht-widget-header title=\"Page Not Found\" allow-collapse=true></div><div class=\"widget-content text-center text-info\"><div class=container>No soup for you!</div></div><div class=widget-foot><div class=clearfix></div></div></div></div></div></section></section>");
$templateCache.put("app/services-store/services-store.html","Services Store");
$templateCache.put("app/mycommunity/community-form-dialog-tmpl.html","<md-dialog aria-label=\"Community Form\" ng-cloak><form name=communityForm><md-toolbar><div class=\"md-toolbar-tools blue darken-2\"><h2 ng-bind=vm.dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=vm.cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-content><md-tabs md-dynamic-height md-border-bottom><md-tab label=\"Step 1\"><h3 class=md-title>Define community name:</h3><md-content class=md-padding><div layout-gt-sm=row><md-input-container flex-gt-sm><md-icon class=material-icons>supervisor_account</md-icon><label>Community Name</label> <input ng-model=community.name md-maxlength=50></md-input-container></div></md-content></md-tab><md-tab label=\"Step 2\"><md-content class=md-padding><h3 class=md-title>Configure profile requirements:</h3></md-content></md-tab><md-tab label=\"Step 3\"><md-content class=md-padding><h3 class=md-title>Enter a member\'s email address:</h3><div layout-gt-sm=row class=autocomplete><md-chips ng-model=vm.members placeholder=\"Enter a member\" delete-button-label=\"Remove member\" delete-hint=\"Press delete to remove member\" secondary-placeholder=+Member></md-chips></div><h3 class=md-title>Or add a new member:</h3></md-content></md-tab></md-tabs></md-content><md-divider></md-divider><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"vm.action(\'cancel\')\">Cancel</md-button><md-button ng-click=\"vm.action(\'save\')\" style=margin-right:20px;>Save</md-button></md-dialog-actions></form></md-dialog>");
$templateCache.put("app/mycommunity/community-form.tmpl.html","<section id=mycommunity-view-form class=mainbar flex=noshrink ng-cloak><form name=communityForm><md-toolbar><div class=\"md-toolbar-tools blue lighten-1\" flex layout=row><span layout=row class=formBackButton><md-button class=md-icon-button ng-click=\"vm.formAction(\'cancel\')\" aria-label=Back><i class=\"material-icons white-text\">arrow_back</i></md-button><h2 ng-click=\"vm.formAction(\'cancel\')\">Back</h2></span> <span flex class=formTitle><h2 ng-bind-html=\"vm.dialogTitle | sanitize\" class=white-text>Dialog Title</h2></span></div></md-toolbar><md-tabs id=communityTabs md-dynamic-height md-border-bottom class=md-padding md-selected=vm.selectedTab><md-tab label=MEMBERS><md-content class=md-padding layout=column><h3 class=md-title>Define group members:</h3><div id=membersChipsContainer layout=column class=autocomplete><md-radio-group ng-model=vm.formOption><md-radio-button value=upload>Add group member(s) via CSV file upload?</md-radio-button><md-radio-button value=manual>or, manually add/choose them?</md-radio-button></md-radio-group><div class=form-box flex-gt-xs ng-show=\"(vm.formOption == \'upload\')\"><label>Download Members Info CSV Template File:</label><div layout-gt-sm=row><md-input-container flex-gt-sm><a href=#><md-icon class=\"material-icons blue-text\">file_download</md-icon>Click here to download the CSV template</a></md-input-container></div><br><label>Upload Members Info CSV File:</label><div layout=row><md-input-container flex><md-icon class=\"material-icons light-green-text darken-2\">file_upload</md-icon><input type=file aria-label=\"Upload CSV File\" ng-file=vm.csvFile ng-placeholder=\"Upload CSV File\" autofocus></md-input-container></div><div layout=row><span flex></span><md-button class=\"md-primary addField grey lighten-2\" ng-click>Upload CSV file</md-button></div></div><div class=form-box flex-gt-xs ng-show=\"(vm.formOption == \'manual\')\"><form name=addMemberForm><label>Search for existing member/s to assign to the group then click the \'Add to Group\' button;<br>or create a new one:</label><md-chips ng-model=vm.membersChips md-autocomplete-snap md-require-match=true md-on-select=\"vm.memberChipAction(\'select\',$chip, $index)\"><md-autocomplete md-no-cache=true md-menu-class=chips-autocomplete md-selected-item=vm.selectedMember md-selected-item-change=\"vm.selectedMemberChange(it, $event)\" md-search-text=vm.memberSearchText md-search-text-change=vm.memberSearchTextChange(vm.memberSearchText) md-items=\"it in vm.querySearch(\'members\', vm.memberSearchText)\" md-item-text=it.email_address md-not-found-click=\"vm.showMemberForm(\'add\',vm.memberSearchText,$event)\" placeholder=\"Enter a member\'s email or mobile no.\"><md-item-template><span class=item-title><strong md-highlight-text=vm.memberSearchText md-highlight-flags=^i>{{it.email_address}}</strong> <span ng-if=it.is_assigned class=red-text>- Already assigned to group.</span></span> <span class=item-metadata><span class=item-metastat><em>({{it.mobile_number}})</em></span></span></md-item-template><md-not-found><div class=\"not-found blue-text\">No user/s matching \"{{vm.memberSearchText}}\" were found.<br>Click here to create a new one.</div></md-not-found></md-autocomplete><md-chip-template><strong>{{$chip.email_address}}</strong></md-chip-template></md-chips><div layout=row><span flex></span><md-button class=\"md-primary addField grey lighten-2\" ng-click=\"vm.assignedMembersPromise = vm.addMembersToGroup($event)\">Add to Group</md-button></div></form></div><div flex flex-gt-xs style=\"min-height: 265px;\"><p>Members assigned to the group:</p><md-toolbar class=\"listToolbar grey lighten-3\"><div class=md-toolbar-tools layout-fill><md-button class=md-icon-button ng-click=\"vm.showMemberForm(\'add\',null,$event)\" ng-disabled=vm.addMemberDisabled><i class=\"material-icons blue-text\">person_add</i><md-tooltip md-direction=top>Create a new user/member</md-tooltip></md-button><md-button class=md-icon-button ng-click=\"vm.selectedMembersAction(\'toggle-sort\',$event)\"><i class=blue-text ng-class=\"{\'fa fa-sort-alpha-asc\': vm.toggleMemberSortAsc, \'fa fa-sort-alpha-desc\': !vm.toggleMemberSortAsc }\"></i><md-tooltip md-direction=top>Sort: {{(vm.toggleMemberSortAsc ? \'Ascending\' : \'Descending\' )}}</md-tooltip></md-button><span class=\"sort-by blue-text\"><md-select ng-model=vm.sortMembersBy placeholder=\"Sort by...\"><md-option ng-repeat=\"f in vm.allProfileFields\" value=\"{{f.model | lowercase}}\">{{f.label}}</md-option></md-select><md-tooltip md-direction=top>Sort by: {{vm.sortMembersBy}}</md-tooltip></span> <span flex></span> <span style=\"align-items:center; text-align:center; vertical-align:middle; display: flex; min-width:80px\"><label style=\"display: flex\"><i class=\"blue-text material-icons\">search</i></label> <input id=searchSelectedMembers name=SelectedMembers ng-model=vm.searchSelectedMembers type=text ng-change class=blue-text placeholder=\"search member\"></span></div></md-toolbar><div cg-busy=\"{promise:vm.assignedMembersPromise,message:\'Loading assigned members...\',minDuration:500}\"><div class=noFieldData ng-hide=vm.selectedMembers.length>No assigned member/s. Add group member(s) by uploading a Member Info CSV file, or manually add/choose them via Assign Member Form.</div><md-list class=membersList ng-show=\"vm.selectedMembers.length > 0\"><md-list-item class=\"md-3-line list-item secondary-button-padding\" ng-repeat=\"(index, member) in vm.selectedMembers | filter:vm.filterMembersSearch | orderBy:(vm.toggleMemberSortAsc ? vm.sortMembersBy : \'-\'+vm.sortMembersBy )\" layout=row layout-wrap><div class=\"md-list-item-text md-whiteframe-z1 flex listItemBlock\" layout=row ng-click=\"vm.showMemberForm(\'edit\',member,$event)\"><span class=listItemDetail><h3 md-highlight-text=vm.searchSelectedMembers md-highlight-flags=^i>{{member.email_address}}</h3><p md-highlight-text=vm.searchSelectedMembers md-highlight-flags=^i>{{member.roles}}</p><p>Profile status:<span class=\"badge statusDefault\" ng-class=\"{\'isComplete\': member.is_complete}\">{{(member.is_complete ? \'Complete\' : \'Incomplete\')}}</span></p><md-tooltip md-direction=top>{{member.email_address}} ({{member.mobile_number}})</md-tooltip></span><md-divider></md-divider><span class=removeButton><md-button class=\"md-icon-button md-secondary\" ng-click=\"vm.removeMemberFromGroup(member, $event)\"><md-icon class=\"material-icons red-text\">close</md-icon><md-tooltip md-direction=top>Remove member?</md-tooltip></md-button></span></div></md-list-item></md-list></div></div></div></md-content><md-divider></md-divider></md-tab><md-tab label=\"PROFILE REQUIREMENTS\"><md-content class=md-padding><h3 class=md-title>Configure profile requirements:</h3><div flex flex-gt-xs style=\"min-height: 265px;\"><md-toolbar class=\"listToolbar grey lighten-3\"><div class=md-toolbar-tools layout-fill layout-gt-sm=row><span flex></span> <span style=\"align-items:center; text-align:center; vertical-align:middle; display: flex; min-width:80px\"><label style=\"display: flex\"><i class=\"blue-text material-icons\">search</i></label> <input flex-gt-sm id=searchSelectedProfileFields name=SelectedProfileFields ng-model=vm.searchSelectedProfileFields type=text ng-change class=blue-text placeholder=\"search profile field\"></span></div></md-toolbar><md-toolbar class=\"md-theme-light fieldsDivider\"><h2 class=md-toolbar-tools><span>Fields required by Parent Group</span></h2></md-toolbar><ul class=\"profileFieldsList fieldsRequired\"><div class=requiredFieldsContainer><li ng-repeat=\"field in default = (vm.defaultProfileFields)\" class=list-item><div class=\"md-list-item-text md-whiteframe-z0 flex listItemBlock\" layout=row ng-click><span class=listItemDetail layout=row><h3 flex md-highlight-text=vm.searchSelectedProfileFields md-highlight-flags=^i>{{field.label}}</h3><md-divider></md-divider><p flex>Type: {{field.type}}</p></span></div></li></div></ul><md-toolbar class=\"md-theme-light fieldsDivider\"><h2 class=md-toolbar-tools><span>Fields assigned to the Group</span></h2></md-toolbar><div cg-busy=\"{promise:vm.assignedProfileFieldsPromise,message:\'Loading profile fields...\',minDuration:500}\"><div class=noFieldData ng-hide=custom.length>No assigned custom field/s. Type or choose from the textbox below and click the \'Add Custom Field\' button to add the field.</div><ul dnd-list=vm.customProfileFields class=profileFieldsList style=\"min-height: 250px\" ng-show=\"custom.length > 0\"><li ng-repeat=\"field in custom = (vm.customProfileFields) | filter:vm.filterFieldsSearch | orderBy:field.order\" dnd-effect-allowed=move dnd-draggable=field dnd-dragstart=\"vm.dndListHandler(\'onDragStart\',vm.customProfileFields, $index, event)\" dnd-moved=\"vm.customProfileFields.splice($index, 1)\" dnd-dragend=\"vm.dndListHandler(\'onDragEnd\',vm.customProfileFields, $index, event)\" dnd-selected=\"vm.customProfileFields.selected = field\" ng-class=\"{\'selected\': vm.customProfileFields.selected === field}\" class=\"list-item secondary-button-padding\"><dnd-nodrag><div class=\"md-list-item-text md-whiteframe-z1 flex listItemBlock\" layout=row ng-click><span dnd-handle class=handleBar><md-icon class=\"material-icons blue-text\">drag_handle</md-icon></span> <span class=listItemDetail layout=row><h3 flex md-highlight-text=vm.searchSelectedProfileFields md-highlight-flags=^i>{{field.label}}</h3><p flex>Type: {{field.type}}</p></span> <span class=removeButton><md-button class=\"md-icon-button md-secondary\" ng-click=\"vm.profileFieldsAction(\'removeField\',field)\"><md-icon class=\"material-icons red-text\">close</md-icon><md-tooltip md-direction=top>Remove field?</md-tooltip></md-button></span></div></dnd-nodrag></li><li class=dndPlaceholder>Move {{field.label}} here?</li></ul></div></div><p>Add existing and/or custom fields for this group and its sub-groups:</p><div class=fieldsContainer><div layout=row><input type=hidden ng-model=vm.fieldId><md-autocomplete flex md-input-id=profileFieldsAC md-autoselect=false md-autofocus=false md-menu-class=chips-autocomplete md-no-cache=true md-selected-item=vm.selectedField md-selected-item-change=\"vm.selectedFieldChange(itm, index, $event)\" md-search-text=vm.fieldSearchText md-items=\"itm in vm.querySearch(\'profiles\', vm.fieldSearchText)\" md-item-text=itm.label md-min-length=1 md-floating-label=\"Type here to choose or create a new field\"><md-item-template><span class=item-title><strong md-highlight-text=vm.fieldSearchText md-highlight-flags=^i>{{itm.label}}</strong> <span ng-if=itm.is_assigned class=red-text>- Already assigned to group.</span></span> <span class=item-metadata><span class=item-metastat><em>(Type: {{itm.type}})</em></span></span></md-item-template></md-autocomplete><md-input-container class=md-block flex-gt-sm><label>Field Type</label><md-select name=fieldType ng-model=vm.fieldType required ng-class=\"{\'readOnlyField\': vm.toggleReadOnly}\"><md-option ng-repeat=\"type in vm.types\" value={{type.name}}>{{type.name}}</md-option></md-select><div ng-messages=communityForm.fieldType.$error ng-if=communityForm.fieldType.$dirty><div ng-message=required>This is a required field.</div></div></md-input-container><input type=hidden ng-model=vm.fieldModel><md-input-container class=md-block flex=-1><md-checkbox ng-model=vm.fieldIsRequired aria-label=\"Checkbox 1\" ng-click ng-class=\"{\'readOnlyField\': vm.toggleReadOnly}\">Required Field?</md-checkbox></md-input-container></div><div layout=row><span flex></span><md-button class=\"md-primary addField grey lighten-2\" ng-click=\"vm.profileFieldsAction(\'addField\',null,$event)\">Add Custom Field</md-button></div></div></md-content><md-divider></md-divider></md-tab></md-tabs></form></section>");
$templateCache.put("app/mycommunity/community-upload-dialog-tmpl.html","<md-dialog aria-label=\"Community Upload\" ng-cloak><form name=communityUpload><md-toolbar><div class=\"md-toolbar-tools blue darken-2\"><h2 ng-bind=dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-dialog-content><div class=md-dialog-content><div layout-gt-sm=row><md-input-container flex-gt-sm><label>Upload CSV File</label><md-icon class=material-icons>file_upload</md-icon><input type=file aria-label=\"Upload CSV File\" fileread=vm.uploadme ng-placeholder=\"Upload CSV File\"></md-input-container></div></div></md-dialog-content><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"action(\'cancel\')\">Cancel</md-button><md-button ng-click=\"action(\'save\')\" style=margin-right:20px;>Save</md-button></md-dialog-actions></form></md-dialog>");
$templateCache.put("app/mycommunity/group-form-dialog.tmpl.html","<md-dialog aria-label=\"Group Form\" ng-cloak flex><form name=groupForm><md-toolbar><div class=\"md-toolbar-tools blue darken-2\"><h2 ng-bind=dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-content id=groupFormDialog class=autoScroll><div class=md-dialog-content><h3 class=md-title>Define group information:</h3><div layout-gt-sm=row><md-input-container flex-gt-sm class=\"md-icon-left md-block\"><label>Group Name</label><md-icon class=material-icons>supervisor_account</md-icon><input name=label ng-model=groupLabel md-maxlength=50 required ng-change=validateGroupForm()><div ng-messages=groupForm.label.$error><div ng-message=required>This is a required field.</div></div></md-input-container></div><div layout-gt-sm=row><md-input-container flex-gt-sm class=\"md-icon-left md-block\"><label>Group Description</label><md-icon class=material-icons>description</md-icon><textarea name=description ng-model=groupDescription md-maxlength=100 rows=3 md-select-on-focus></textarea></md-input-container></div></div></md-content><md-divider></md-divider><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"action(\'cancel\')\">Cancel</md-button><md-button ng-click=\"action(\'save\')\" style=margin-right:20px; ng-disabled=isSaveDisabled>Save</md-button></md-dialog-actions></form></md-dialog>");
$templateCache.put("app/mycommunity/member-form-dialog-tmpl.html","<md-dialog aria-label=\"Member Form\" ng-cloak flex><form name=memberForm><md-toolbar><div class=\"md-toolbar-tools light-green darken-2\"><h2 ng-bind=vm.dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-content id=memberFormDialog class=autoScroll><div class=md-dialog-content><div layout-gt-sm=row><md-input-container class=\"md-icon-left md-block\" flex-gt-sm><md-icon class=\"material-icons email\">email</md-icon><input id=email name=email ng-model=\"vm.member.profiles[\'email_address\']\" type=text placeholder=\"Email Address (required)\" md-autofocus required ng-change=vm.validateInput()><div ng-messages=memberForm.email.$error><div ng-message=required>This is a required field.</div><div ng-message=invalid-email>Email address is invalid.</div></div></md-input-container><md-input-container class=\"md-icon-left md-block\" flex-gt-sm><md-icon class=\"material-icons mobileno\">phone</md-icon><input id=mobileno name=mobileno ng-model=\"vm.member.profiles[\'mobile_number\']\" type=text placeholder=\"Mobile Number (required)\" required ng-change=vm.validateInput()><div ng-messages=memberForm.mobileno.$error><div ng-message=required>This is a required field.</div><div ng-message=invalid-mobileno>Mobile number is invalid.</div></div></md-input-container></div><div class=md-block flex><label>Define member role: <em>(<a href=#>Create a new role?</a>)</em></label><multi-select ng-model=vm.member.role_group available=vm.roles selected-label=\"Current role(s)\" available-label=\"Available role(s)\" display-attr=rolelabel config=vm.selectConfig></multi-select><div class=input-error ng-show=memberForm.numSelected.$error.min>Please select at least<ng-pluralize count=vm.selectConfig.requiredMin when=\"{\'one\': \'one role\', \'other\': \'{} roles\'}\">.</ng-pluralize></div></div><div ng-repeat=\"(index, field) in vm.profileFields | orderBy:field.order\"><div layout-gt-sm=row><md-input-container class=md-block flex-gt-sm><label>{{field.label}}</label> <input ng-model=vm.member.profiles[field.model] type={{field.type}}></md-input-container></div></div></div></md-content><md-divider></md-divider><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"action(\'cancel\')\">Cancel</md-button><md-button ng-click=\"action(\'save\')\" style=margin-right:20px; ng-disabled=vm.isSaveDisabled>Save</md-button></md-dialog-actions></form></md-dialog>");
$templateCache.put("app/mycommunity/member-list.tmpl.html","<md-dialog aria-label=\"List of Members\" ng-cloak style=\"min-width: 500px;\"><md-toolbar><div class=\"md-toolbar-tools blue darken-2\"><h2 ng-bind=dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-dialog-content style=\"min-height: 41px;height: 41px;line-height: 41px;\"><form><md-autocomplete md-selected-item=selectedItem md-search-text=searchText md-items=\"member in memberData | filter:searchText\" md-item-text=member.name md-min-length=0 placeholder=\"Search for Member/s\"><md-item-template><span md-highlight-text=searchText md-highlight-flags=^i>{{member.name}}</span></md-item-template></md-autocomplete></form></md-dialog-content><md-dialog-content class=autoScroll><div style=\"min-height: 265px;\"><md-list ng-cloak class=listControls><md-list-item ng-repeat=\"m in memberData | filter:searchText\" class=\"md-2-line secondary-button-padding\" ng-click=doPrimaryAction($event)><div class=md-list-item-text><h3>{{ m.email }}</h3><p>{{ m.mobileNo }}</p><md-button class=md-secondary ng-click=doSecondaryAction($event)>More Info</md-button></div></md-list-item></md-list></div></md-dialog-content><md-divider></md-divider><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"action(\'cancel\')\" class=\"md-raised blue darken-2 grey-text text-lighten-2\">Close</md-button></md-dialog-actions></md-dialog>");
$templateCache.put("app/mycommunity/mycommunity.html","<section id=mycommunity-view class=mainbar flex=noshrink><div layout=column flex=noshrink><md-content layout=row layout-padding layout-xs=column><div flex flex-gt-xs=60><md-card><md-card-title class=\"blue lighten-1\"><md-card-title-text class=white-text><span class=md-headline><strong>Community Structure</strong></span></md-card-title-text></md-card-title><div class=card-toolbar><md-toolbar class=\"grey lighten-3\"><div class=md-toolbar-tools layout-fill><md-button class=md-icon-button ng-click=vm.communityTree.expand_all()><i class=\"fa fa-expand blue-text\"></i><md-tooltip md-direction=bottom>Expand all</md-tooltip></md-button><md-button class=md-icon-button ng-click=vm.communityTree.collapse_all()><i class=\"fa fa-compress blue-text\"></i><md-tooltip md-direction=bottom>Collapse all</md-tooltip></md-button><md-button class=md-icon-button ng-click=\"vm.showGroupDialog(\'add\', $event)\"><md-icon class=\"material-icons blue-text\">note_add</md-icon><md-tooltip md-direction=bottom>Add a Sub-Group</md-tooltip></md-button><md-button class=md-icon-button ng-click=\"vm.subGroupAction(\'delete\',$event)\"><md-icon class=\"material-icons blue-text\">delete</md-icon><md-tooltip md-direction=bottom>Remove a Sub-Group</md-tooltip></md-button><span flex></span> <span style=\"align-items:center; text-align:center; vertical-align:middle; display: flex\"><label style=\"display: flex\"><i class=\"blue-text material-icons\">search</i></label> <input id=searchTreeId name=searchTree ng-model=vm.searchTreeText type=text ng-change=\"vm.searchTreeHandler(vm.searchTreeText, $event)\" class=blue-text placeholder=\"search group name\"></span></div></md-toolbar><md-divider></md-divider></div><md-card-content class=\"community-content autoScroll\" cg-busy=\"{promise:vm.treeDataPromise,message:\'Loading Tree Data\',minDuration:500}\"><abn-tree tree-data=vm.treeData tree-control=vm.communityTree icon-leaf=\"fa fa-object-group\" icon-expand=\"fa fa-chevron-down\" icon-collapse=\"fa fa-chevron-right\" on-select=vm.treeHandler(branch) expand-level=2 initial-selection={{vm.initialSelection}}></abn-tree></md-card-content></md-card></div><div flex flex-gt-xs=40 layout=column><md-card ng-if=vm.hasSelected><md-card-title class=light-green><md-card-title-text class=white-text><span class=md-headline><strong>{{vm.selectedCompany.label}} details</strong></span> <span class=md-subhead>{{vm.selectedCompany.description}} {{vm.selectedCompany.id}}</span></md-card-title-text></md-card-title><md-card-content class=\"member-content autoScroll\"><p>No. of Sub-groups: <span class=badge>{{vm.selectedCompany.data.subGroupCount}}</span></p><p>Members: <span class=badge>{{vm.selectedCompany.data.memberCount}}</span></p><p>Company Admins: <span class=badge>{{vm.selectedCompany.data.compAdminCount}}</span></p><p>Group Moderators: <span class=badge>{{vm.selectedCompany.data.grpModCount}}</span></p></md-card-content><md-divider></md-divider><div layout=row class=group-buttons><md-button flex=50 ng-click=\"vm.showGroupDialog(\'edit\', $event)\"><i class=\"material-icons md-36\" flex>mode_edit</i><md-tooltip md-direction=top>Update Group Details</md-tooltip></md-button><md-divider></md-divider><md-button flex=50 ng-click=\"vm.subGroupAction(\'edit\',$event,\'members\')\"><i class=\"material-icons md-36\" flex>group_add</i><md-tooltip md-direction=top>Define Group Members & Membership Rules</md-tooltip></md-button></div></md-card></div></md-content><div flex></div></div></section>");
$templateCache.put("app/mycommunity/node.tmpl.html","<li layout=flex><md-icon class=\"material-icons blue-text\" ng-click=toggleVisibility(node)>{{ ( node.childrenVisibility && node.children.length ) ? \'expand_more\' : (node.children.length ? \'expand_less\' : \'group\') }}</md-icon><span ng-class=\"{\'node-selected\': node.isSelected}\" ng-click=selectNode(node)>{{ node.name }}</span></li>");
$templateCache.put("app/myservices/message-preview-dialog-tmpl.html","<md-dialog aria-label=\"Message Preview\" ng-cloak flex><form name=messagePreview><md-toolbar><div class=\"md-toolbar-tools blue darken-2\"><h2 ng-bind=vm.dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-content id=msgPreviewDialog class=autoScroll><div class=md-dialog-content><div class=mp-header><div layout-gt-sm=row class=md-block flex><span class=mp-header-label>Recipients:</span> <span class=mp-header-value flex>vldolot@gmail.com (+639181234567)</span></div><div layout-gt-sm=row class=md-block flex><span class=mp-header-label>Subject:</span> <span class=mp-header-value flex>Sample Subject</span></div><div layout-gt-sm=row class=md-block flex><span class=mp-header-label>Broadcast Schedule:</span> <span class=mp-header-value flex>2016-04-27 04:59 PM</span></div></div><div class=mp-message-details><div layout-gt-sm=row class=md-block flex><md-table-container flex class=\"md-block md-whiteframe-z1\"><table md-table ng-model=vm.messageDetailsModel><thead md-head md-order=vm.query.order><tr md-row><th md-column md-order-by=detail.network><span>Network</span></th><th md-column md-numeric># of Recipients</th><th md-column md-numeric># of Characters</th><th md-column md-numeric># of SMS</th></tr></thead><tbody md-body><tr md-row md-select=detail md-select-id=network md-auto-select ng-repeat=\"detail in vm.messageDetails\"><td md-cell>{{detail.network}}</td><td md-cell>{{detail.recipients}}</td><td md-cell>{{detail.characters}}</td><td md-cell>{{detail.sms}}</td></tr></tbody></table></md-table-container></div><div layout-gt-sm=row class=\"md-block mp-message-details-total\" flex>Total SMS:&nbsp;<span class=\"blue-text text-darken-2\">1</span></div></div><div class=mp-message><div layout-gt-sm=row class=\"md-block mp-message-counter\" flex>Message&nbsp;<em>(100/140)</em>:</div><div layout-gt-sm=row class=\"md-block mp-message-content\" flex>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div></div><div class=mp-optout-message><div layout-gt-sm=row class=\"md-block mp-optout-message-title\" flex>Opt-out Message:</div><div layout-gt-sm=row class=\"md-block mp-optout-message-content\" flex>- None -</div></div></div></md-content><md-divider></md-divider><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"action(\'cancel\')\">Cancel</md-button><md-button ng-click=\"action(\'send\')\" style=margin-right:20px; class=md-primary>Send</md-button></md-dialog-actions></form></md-dialog>");
$templateCache.put("app/myservices/schedule-sms-dialog-tmpl.html","<md-dialog aria-label=\"Schedule SMS\" ng-cloak flex-gt-sm=50><form name=scheduleSMS><md-toolbar><div class=\"md-toolbar-tools blue darken-2\"><h2 ng-bind=vm.dialogTitle>Dialog Title</h2><span flex></span><md-button class=md-icon-button ng-click=cancel()><md-icon aria-label=\"Close dialog\" class=material-icons>close</md-icon></md-button></div></md-toolbar><md-content id=scheduleSMSDialog class=autoScroll><div class=md-dialog-content><div layout-gt-sm=row class=\"md-block schsms-title\" flex>Please select date and time for message delivery:</div><div layout-gt-sm=row class=md-block flex></div></div></md-content><md-divider></md-divider><md-dialog-actions layout=row><span flex></span><md-button ng-click=\"action(\'cancel\')\">Cancel</md-button><md-button ng-click=\"action(\'schedule\')\" style=margin-right:20px; class=md-primary>Schedule Delivery</md-button></md-dialog-actions></form></md-dialog>");
$templateCache.put("app/myservices/services.boombastext.html","<section id=services-boombastext-view class=mainbar flex=noshrink>BOOMBASTEXT</section>");
$templateCache.put("app/myservices/services.broadcast.html","<section id=services-broadcast-view class=mainbar flex=noshrink><form name=broadcastForm><md-tabs id=broadcastTabs md-dynamic-height md-border-bottom class=md-padding md-selected=vm.selectedTab><md-tab label=\"COMPOSE MESSAGE\"><md-content class=md-padding><h3 class=md-title>Compose Message:</h3><p>Compose your sms message and complete the data fields. If you have a csv file, you can use <a href=#>bulk upload</a>.</p><div class=broadcast-form flex><md-chips ng-model=vm.message.contacts md-autocomplete-snap md-require-match=true md-on-select=\"vm.contactsChipAction(\'select\',$chip, $index)\"><md-autocomplete md-no-cache=true md-menu-class=chips-autocomplete md-selected-item=vm.selectedContact md-selected-item-change=\"vm.selectedContactChange(item, $event)\" md-search-text=vm.contactSearchText md-search-text-change=vm.contactSearchTextChange(vm.contactSearchText) md-items=\"item in vm.querySearch(\'contacts\', vm.contactSearchText)\" md-item-text=item.email_address placeholder=\"Recipients: (Enter User Name / Group Name / Email Address or Mobile No.)\"><md-item-template><span class=item-title><strong md-highlight-text=vm.contactSearchText md-highlight-flags=^i>{{item.email_address}} ({{item.mobile_number}})</strong> <span ng-if=item.is_assigned class=red-text>- Already assigned as recipient.</span></span></md-item-template></md-autocomplete><md-chip-template><strong>{{$chip.email_address}}</strong></md-chip-template></md-chips><div layout=row style=\"padding-top: 30px\"><md-input-container flex class=md-block><label>Sender Name</label><md-select ng-model=vm.message.sendername><md-option ng-repeat=\"n in vm.senderNames\" value=\"{{n.key | lowercase}}\">{{n.value}}</md-option></md-select><div class=hint>A name that you can create and use to identify and differentiate your messages. You can only use your own message subject.</div></md-input-container></div><div layout=row style=\"padding-top: 30px\"><md-input-container flex class=md-block><label>Message</label> <textarea class=msgTextArea ng-model=vm.message.body md-maxlength=140 rows=3 md-select-on-focus></textarea></md-input-container></div><div layout=row><md-input-container class=md-block flex><label>Description</label> <input ng-model=vm.message.description type=text><div class=hint>You can create a name or label that describe your message for easier tracking.</div></md-input-container></div><div layout=row><md-input-container class=md-block flex><md-switch class=md-primary aria-label=\"Include Opt-Out Message\" ng-model=vm.message.optout>Include Opt-Out Message</md-switch><div class=hint>Opt out message is a message that informs and reminds your recipients on how they can choose to stop receiving sms message from your account.</div></md-input-container></div></div><div layout=row style=\"align-items: center; padding-top: 10px;\"><md-button class=\"blue lighten-2 blue-text text-lighten-5 sendMessageBtn\" ng-click=\"vm.showMessagePreview(\'now\',$event)\">Send Message</md-button><span flex>Or, <a href=# ng-click=\"vm.showMessagePreview(\'later\',$event)\">schedule it for later delivery?</a></span></div></md-content><md-divider></md-divider></md-tab><md-tab label=\"UPLOAD MESSAGE FROM CSV\"><md-content class=md-padding><h3 class=md-title>Upload Message from CSV file:</h3><p>You can use bulk upload for sending large number of sms messages using a csv file. You can download the csv file by clicking the icon and populate it with your data or messages.</p><div class=broadcast-form flex><div>Download Message CSV Template File:</div><div layout=row><md-input-container flex><a href=#><md-icon class=\"material-icons blue-text\">file_download</md-icon>Click here to download the CSV file</a></md-input-container></div><br><div>Choose CSV File to upload:</div><div layout=row><md-input-container flex><md-icon class=\"material-icons light-green-text darken-2\">file_upload</md-icon><input type=file aria-label=\"Upload CSV File\" ng-file=vm.csvFile ng-placeholder=\"Upload CSV File\" autofocus></md-input-container></div><div layout=row><md-input-container class=md-block flex><md-switch class=md-primary aria-label=\"Include Opt-Out Message\" ng-model=vm.message.optout>Include Opt-Out Message</md-switch><div class=hint>Opt out message is a message that informs and reminds your recipients on how they can choose to stop receiving sms message from your account.</div></md-input-container></div></div><div layout=row style=\"align-items: center; padding-top: 10px;\"><md-button class=\"blue lighten-2 blue-text text-lighten-5 sendMessageBtn\" ng-click=\"vm.showMessagePreview(\'bulk\',$event)\">Send Message</md-button></div></md-content><md-divider></md-divider></md-tab></md-tabs></form></section>");
$templateCache.put("app/myservices/services.which.html","<section id=services-which-view class=mainbar flex=noshrink>WHICH</section>");
$templateCache.put("app/layout/bottom-sheet-grid-tmpl.html","<md-bottom-sheet class=md-grid layout=column ng-cloak><div layout=row layout-align=\"center center\" class=md-whiteframe-z1><h4>{{headerTitle}}</h4></div><div><md-list flex layout=row layout-align=\"center center\"><md-list-item ng-repeat=\"item in items\"><md-button class=md-grid-item-content ng-click=listItemClick($index) aria-label={{item.name}}><i class=material-icons>{{item.icon}}</i><div class=md-grid-text>{{ item.name }}</div></md-button></md-list-item></md-list></div></md-bottom-sheet>");
$templateCache.put("app/layout/bottom-sheet-list-tmpl.html","<md-bottom-sheet class=\"md-list md-has-header\" ng-cloak><md-subheader class=md-whiteframe-z1>{{headerTitle}}</md-subheader><md-list><md-list-item ng-repeat=\"item in items\" role=listitem><a flex aria-label={{item.name}} ng-click=listItemClick($index)><i class=material-icons>{{item.icon}}</i> <span class=md-inline-list-icon-label>{{item.name}}</span></a></md-list-item></md-list></md-bottom-sheet>");
$templateCache.put("app/layout/ht-top-nav.html","<nav class=\"navbar navbar-fixed-top navbar-inverse\"><div class=navbar-header><a href=\"/\" class=navbar-brand><span class=brand-title>{{vm.navline.title}}</span></a> <a class=\"btn navbar-btn navbar-toggle\" data-toggle=collapse data-target=.navbar-collapse><span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></a></div><div class=\"navbar-collapse collapse\"><div class=\"pull-right navbar-logo\"><ul class=\"nav navbar-nav pull-right\"><li><a ng-href={{vm.navline.link}} target=_blank>{{vm.navline.text}}</a></li><li class=\"dropdown dropdown-big\"><a href=http://www.angularjs.org target=_blank><img src=app/images/AngularJS-small.png></a></li><li><a href=\"http://www.gulpjs.com/\" target=_blank><img src=app/images/gulp-tiny.png></a></li></ul></div></div></nav>");
$templateCache.put("app/layout/shell.html","<div ng-controller=\"ShellController as vm\" layout=row><md-sidenav class=\"md-sidenav-left md-whiteframe-z2\" md-component-id=left md-is-locked-open=\"$mdMedia(\'gt-sm\')\"><md-toolbar md-scroll-shrink class=\"nav-header blue-grey darken-3\"><div class=md-toolbar-tools ng-cloak><a href=\"/\"><div class=\"brand-logo white-text\"><i class=\"material-icons light-blue-text text-lighten-4\">person_pin</i> <strong>Smart</strong>Communities</div></a> <span flex></span><md-menu md-position-mode=\"target-right target\"><md-button class=md-icon-button aria-label=\"More Options\" ng-click=$mdOpenMenu($event)><i class=\"material-icons white-text\">more_vert</i></md-button><md-menu-content width=3><md-menu-item ng-repeat=\"item in [1, 2, 3]\"><md-button ng-click=vm.announceClick($index)><div layout=row><p flex>Option {{item}}</p></div></md-button></md-menu-item></md-menu-content></md-menu></div></md-toolbar><header class=side-nav-user><div class=user-item><span class=user-avatar><i class=material-icons>account_circle</i></span> <a href=# class=user-name>User Name&nbsp;<i class=material-icons>arrow_drop_down</i></a> <span class=user-role><small>User Role</small></span></div></header><div ng-include=\"\'app/layout/sidebar.html\'\"></div></md-sidenav><div layout=column tabindex=-1 role=main flex><md-toolbar class=\"md-whiteframe-z1 site-content-toolbar\" ng-show=!vm.showSearch><div class=\"md-toolbar-tools topbar-toolbar-tools\" tabindex=-1><md-button class=md-icon-button hide-gt-sm ng-click=vm.toggleLeftMenu() aria-label=\"Toggle Menu\"><i class=\"material-icons white-text\">menu</i></md-button><div layout=row flex class=fill-height><h3 ng-bind=currentPageTitle>Home / Dashboard</h3><span flex></span><div layout=row class=\"md-toolbar-item topbar-tools\"><md-button class=md-icon-button aria-label=Search ng-click=\"vm.showSearch = !vm.showSearch\"><i class=\"material-icons white-text\">search</i></md-button><md-button class=md-icon-button aria-label=\"More Vert\" ng-click=vm.showListBottomSheet($event)><i class=\"material-icons white-text\">more_vert</i></md-button></div></div></div></md-toolbar><md-toolbar class=\"site-content-toolbar md-whiteframe-z1\" ng-show=vm.showSearch><div class=\"md-toolbar-tools topbar-toolbar-tools\" tabindex=-1><div layout=row flex class=fill-height><md-button class=md-icon-button ng-click=\"vm.showSearch = !vm.showSearch\" aria-label=Back><i class=\"material-icons white-text\">arrow_back</i></md-button><h3 flex>Back</h3><span flex></span><div layout=row class=\"md-toolbar-item topbar-tools\"><md-input-container><label>Enter search</label> <input ng-model=search.what placeholder=\"enter search\"></md-input-container><md-button class=md-icon-button aria-label=Search ng-click=\"vm.showSearch = !vm.showSearch\"><i class=\"material-icons white-text\">search</i></md-button><md-button class=md-icon-button aria-label=\"Open Settings\" ng-click=vm.showListBottomSheet($event)><i class=\"material-icons white-text\">more_vert</i></md-button></div></div></div></md-toolbar><md-content md-scroll-y flex layout=column><div ui-view flex=noshrink layout-align=\"top center\"></div></md-content></div></div>");
$templateCache.put("app/layout/side-nav-link.html","<md-button ng-class ui-sref-active=active ui-sref={{section.state}} ng-click=closeNav(section)><i class=material-icons>{{section.icon}}</i>{{section | humanizeDoc}} <span class=md-visually-hidden ng-if=isSelected()>current page</span></md-button>");
$templateCache.put("app/layout/side-nav-toggle.html","<md-button class=\"md-button-toggle flex\" ng-click=toggle() aria-controls=\"docs-menu-{{section.name | nospace}}\" layout=row aria-expanded={{isOpen()}}><span><i class=material-icons>{{section.icon}}</i>{{section.name}}</span> <span flex></span> <span aria-hidden=true class=md-toggle-icon ng-class=\"{\'toggled\' : isOpen()}\"><i class=material-icons>expand_more</i></span></md-button><ul ng-show=isOpen() id=\"docs-menu-{{section.name | nospace}}\" class=menu-toggle-list><li ng-repeat=\"page in section.pages\"><side-nav-link ng-class=isCurrent(page) section=page></side-nav-link></li></ul>");
$templateCache.put("app/layout/sidebar.html","<div ng-controller=\"SidebarController as vm\" id=app-side-nav><md-content flex role=navigation class=flex><md-list class=side-menu><md-subheader>Menu</md-subheader><md-item ng-repeat=\"item in vm.menu\" class=parent-list-item><span class=menu-heading ng-if=\"item.type === \'heading\'\" id=\"heading_{{ item.state | nospace }}\">{{item}}</span><side-nav-link ng-class=vm.isCurrent(item) section=item ng-if=\"item.type === \'link\'\"></side-nav-link><side-nav-toggle section=item ng-if=\"item.type === \'toggle\'\"></side-nav-toggle></md-item><md-divider></md-divider></md-list></md-content></div>");
$templateCache.put("app/dashboard/dashboard.html","<section id=dashboard-view class=mainbar layout-padding><div><div class=row><md-content class layout-xs=column layout=row><div flex-xs flex-gt-xs=100 layout=column><md-card class=\"blue-grey darken-2\"><md-card-title><md-card-title-text class=white-text><span class=md-headline>Welcome to <strong>Smart</strong>Communities!</span> <span class=md-subhead>Some description here...</span></md-card-title-text></md-card-title><md-divider></md-divider><md-card-actions layout=row layout-align=\"end center\" class=\"light-blue-text text-lighten-4\"><md-button>Learn more</md-button></md-card-actions></md-card></div></md-content><md-content layout-xs=column layout=row><div flex-xs flex-gt-xs=33 layout=column><md-card class=\"pink lighten-1\"><md-card-title><md-card-title-text class=white-text><span class=md-headline><strong>{{vm.groupMsgsCount}}</strong></span> <span class=md-subhead>New group messages</span></md-card-title-text></md-card-title></md-card></div><div flex-xs flex-gt-xs=33 layout=column><md-card class=\"light-green darken-1\"><md-card-title><md-card-title-text class=white-text><span class=md-headline><strong>{{vm.privMsgsCount}}</strong></span> <span class=md-subhead>New private messages</span></md-card-title-text></md-card-title></md-card></div><div flex-xs flex-gt-xs=33 layout=column><md-card class=blue><md-card-title><md-card-title-text class=white-text><span class=md-headline><strong>{{vm.newServicesCount}}</strong></span> <span class=md-subhead>New services in the Services Store</span></md-card-title-text></md-card-title></md-card></div></md-content></div></div></section>");}]);