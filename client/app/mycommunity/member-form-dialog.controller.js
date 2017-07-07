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
