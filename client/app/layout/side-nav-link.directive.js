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