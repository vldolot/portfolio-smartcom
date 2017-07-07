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