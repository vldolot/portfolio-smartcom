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
