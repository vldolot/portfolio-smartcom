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
