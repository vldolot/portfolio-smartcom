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
