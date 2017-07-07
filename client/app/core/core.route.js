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
