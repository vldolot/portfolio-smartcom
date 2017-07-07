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
