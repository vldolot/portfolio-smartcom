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