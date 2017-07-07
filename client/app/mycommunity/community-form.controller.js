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
