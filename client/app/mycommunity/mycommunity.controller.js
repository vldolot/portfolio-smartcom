(function() {
    'use strict';

    angular
        .module('app.community')
        .controller('CommunityController', CommunityController);

    CommunityController.$inject = ['$rootScope', '$q', '$scope', '$mdDialog', '$mdMedia',
                                   '$log', 'DataService', '$state', 'localStorageService',
                                   '$timeout'];
    /* @ngInject */
    function CommunityController($rootScope, $q, $scope, $mdDialog, $mdMedia,
                                 $log, DataService, $state, localStorageService,
                                 $timeout) {
        var vm = this;
        var tree;
        vm.title = 'My Community';
        vm.isOpen = false;
        vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

        vm.ftbleft = {
          isOpen: false,
          selectedDirection: 'right',
          selectedMode: 'md-fling'
        };
        vm.ftbright = {
          isOpen: false,
          selectedDirection: 'left',
          selectedMode: 'md-fling'
        };

        vm.hasSelected = false;

        vm.showAddCommunity = showAddCommunity;
        vm.showUploadCommunity = showUploadCommunity;
        vm.showAddMember = showAddMember;
        vm.showMemberList = showMemberList;
        vm.showGroupDialog = showGroupDialog;

        /* tree controls */
        vm.initialSelection = '';
        vm.treeData = [];
        vm.treeDataPromise = angular.noop;
        vm.communityTree = tree = {};
        vm.treeHandler = treeHandler;
        vm.subGroupAction = subGroupActionHandler;
        vm.searchTreeHandler = searchTreeHandler;

        //localStorageService.clearAll();
        //vm.treeData = (localStorageService.get('treeData') != null) && localStorageService.get('treeData');
        //vm.updateGroupIcon = '../images/icons/ic_border_color_black_24px.svg';

        vm.groupData = [];
        loadGroupData();
        activate();

        ////////////////
        function activate() {
          $log.info('Activated My Community View');
          //$log.debug('localStorageService.isSupported: ' + localStorageService.isSupported);
        }

        function loadGroupData () {
            vm.treeDataPromise = DataService.getGroupData();
            vm.treeDataPromise.then(function (result) {

              //localStorageService.set('groupData', result.data);
              vm.groupData = result.data;
              $log.info(vm.groupData);
              buildTree();
            }, function (result) {
              $log.error("Group data not available, Error: " + result);
            });
        }

        function buildTree() {
          var level = 1;
          var group = _.filter(vm.groupData, {
            level: level
          });
          var tree = [{
            _id: Number(group[0]._id),
            label: group[0].label,
            description: group[0].description,
            level: group[0].level,
            relationships: group[0].relationships,
            profile_fields: group[0].profile_fields,
            data: { compAdminCount: 0, grpModCount: 0, memberCount: 0 },
            children: []
          }];
          if (group[0].relationships.length > 0){
            _.forEach(group[0].relationships, function (member) {
              if (member.role_group == 'company_admin') tree[0].data['compAdminCount'] = member.values.length;
              if (member.role_group == 'group_moderator') tree[0].data['grpModCount'] = member.values.length;
              if (member.role_group == 'member') tree[0].data['memberCount'] = member.values.length;
            });
          }

          var model = {};
          var obj = {};

          while (group && group.length > 0) {
            level += 1;
            group = _.filter(vm.groupData, {
              level: level
            });
            _.forEach(group, function(g) {
              model = {
                _id: g._id,
                label: g.label,
                description: g.description,
                level: g.level,
                relationships: g.relationships,
                profile_fields: g.profile_fields,
                data: { compAdminCount: 0, grpModCount: 0, memberCount: 0 },
                children: []
              };
              if (g.relationships.length > 0){
                _.forEach(g.relationships, function (member) {
                  if (member.role_group == 'company_admin') model.data['compAdminCount'] = member.values.length;
                  if (member.role_group == 'group_moderator') model.data['grpModCount'] = member.values.length;
                  if (member.role_group == 'member') model.data['memberCount'] = member.values.length;
                });
              }

              forEachBr(tree, function(t) {
                if (t._id == Number(g.parentid)){
                  t.children.push(model);
                }
              });
            });
          }
          vm.treeData = tree;
          // console.log('vm.treeData',vm.treeData);
          // if (localStorageService.get('treeData') == null) {
          //   vm.treeDataPromise = MyCommunityService.getTreeData();
          //   vm.treeDataPromise.then(function (result) {
          //     //vm.treeData = result.data;

          //     localStorageService.set('treeData', result.data);
          //     vm.treeData = result.data;
          //   }, function (result) {
          //     $log.error("Tree not available, Error: " + result);
          //   });
          // } else {
          //   vm.treeData = localStorageService.get('treeData');
          // }
          if (vm.treeData[0]){
            vm.initialSelection = vm.treeData[0].label;
          }
        }

        function searchTreeHandler(text, e){
          var t = vm.treeData;

          if (text.length > 0){
            forEachBr(vm.treeData, function(t) {
              if (t.label.toLowerCase().startsWith(text.toLowerCase())){
                $timeout(function() {
                  vm.communityTree.select_branch(t);
                });
              }
            });
          } else {
            vm.communityTree.select_branch(-1);
            vm.communityTree.collapse_all();
          }

        }

        function treeHandler(branch) {
          var _ref;
          //$log.info(branch);

          vm.hasSelected = true;
          vm.selectedCompany = branch;
          //if ((_ref = branch.data) != null ? _ref.description : void 0) {
            //vm.selectedCompanyDesc = branch.data.description;
            //return vm.selectedCompanyDesc += '(' + branch.data.description + ')';
          //} else {
            //vm.selectedCompanyDesc = "";
          //}
          //$log.debug(branch);
        }

        function subGroupActionHandler(action, ev, showTab) {
          var b = vm.communityTree.get_selected_branch();

          if (vm.hasSelected){
            if ((action == 'add') || (action == 'edit')){
              $state.go('community.form',{action: action, groupObj: b, showTab: showTab});
            } else { // delete
              var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to delete ' + b.label + '?')
                    .textContent('Warning: \r\nThis group and all its sub-groups will be deleted. \r\nThis action can\'t be undone.')
                    .ariaLabel('Remove Sub Group')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');

              if (b.label == vm.treeData[0].label){
                showAlert('Cannot delete the top-most group.',
                    'Remove Sub Group Dialog', ev);
              } else {
                $mdDialog.show(confirm).then(function() {
                  // delete selected group and its sub-groups from Groups collection
                  var subs = [];
                  subs = getSubBranches (b, vm.communityTree, subs);
                  // $log.debug(subs);

                  // get all sub-group ids
                  var subIds = '';
                  if (subs){
                    if (subs.length > 0){
                      subIds = b._id + ',';
                      _.times(subs.length, function(i) {
                        if (i == subs.length-1){
                          subIds += subs[i]._id;
                        } else {
                          subIds += subs[i]._id + ',';
                        }
                      });
                    }
                  } else { subIds = b._id; }
                  // $log.info(subIds);

                  vm.treeDataPromise = DataService.deleteGroupData(subIds);
                  vm.treeDataPromise.then(function (result) {
                    $log.debug('Deleted: ' + b.label);

                    // delete selected group and its sub-groups from treeview
                    deleteSubArray(vm.treeData, b._id);

                    //save the updated treeData to localstorage
                    //localStorageService.set('treeData', vm.treeData);
                  }, function (result) {
                    $log.error("Error on deletion of group data, Error: " + result);
                  });
                }, function() {
                  $log.debug('Deletion of: ' + b.label + ' has been cancelled.');
                });
              }
            }

          } else {
            var dTitle = (action == 'add') ? 'Add' : ((action == 'edit') ? 'Edit' : 'Remove');
            showAlert('Please select a group from the TreeView.',
                  dTitle+' Sub-Group Dialog', ev);
          }

        }

        function showAlert(title, ariaLabel, ev){
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title(title)
              .ariaLabel(ariaLabel)
              .ok('Ok')
              .targetEvent(ev)
          );
        }

        function showAddCommunity(ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: CommunityFormDialogCtrl,
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/community-form-dialog-tmpl.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            $log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

          /*$scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
          }, function(wantsFullScreen) {
            vm.customFullscreen = (wantsFullScreen === true);
          });*/

        }

        function showUploadCommunity(ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: CommunityUploadDialogCtrl,
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/community-upload-dialog-tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            $log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

          /*$scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
          }, function(wantsFullScreen) {
            vm.customFullscreen = (wantsFullScreen === true);
          });*/
        }

        function showAddMember(ev) {
          //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
              controller: 'MemberFormDialogCtrl',
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/member-form-dialog-tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            //saveMemberData($scope.member);
            //$log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });

        }
        function saveMemberData(action, content, id){
          DataService.saveUserData(action, content, id).then(function (result) {
            $log.info('Member data saved.');
            // $log.info(result);
          }, function (result) {
            $log.error("Cannot save member data, Error: " + result);
          });
        }

        function showGroupDialog (mode, ev) {
          if (vm.hasSelected){
            $mdDialog.show({
                controller: GroupFormDialogCtrl,
                controllerAs: 'vm',
                templateUrl: 'app/mycommunity/group-form-dialog.tmpl.html',
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: { mode: mode }
            })
            .then(function(action) {
              //saveMemberData($scope.member);
              $log.info('You clicked the "' + action + '" button.');
            }, function() {
              $log.info('You cancelled the dialog.');
            });
          } else {
            showAlert('Please select a group from the TreeView.',
                  'Add Sub-Group Dialog', ev);
          }
        }

        function showMemberList(ev){
          $mdDialog.show({
              controller: MemberListDialogCtrl,
              controllerAs: 'vm',
              templateUrl: 'app/mycommunity/member-list.tmpl.html',
              targetEvent: ev,
              clickOutsideToClose:true,
          })
          .then(function(action) {
            $log.info('You clicked the "' + action + '" button.');
          }, function() {
            $log.info('You cancelled the dialog.');
          });
        }

        CommunityUploadDialogCtrl.$inject = ['$scope', '$mdDialog'];
        /* @ngInject */
        function CommunityUploadDialogCtrl($scope, $mdDialog){
          $scope.dialogTitle = 'Add New Community';
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

        MemberListDialogCtrl.$inject = ['$scope', '$mdDialog'];
        /* @ngInject */
        function MemberListDialogCtrl($scope, $mdDialog){
          $scope.dialogTitle = 'List of Members';
          $scope.searchText = "";

          fetchMembers();

          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.action = function(action) {
            $mdDialog.hide(action);
          };

          function fetchMembers(){
              DataService.getUserData().then(function (result) {
                //$log.debug(result);
                $scope.memberData = result.data;
              }, function (result) {
                $log.error("Member data not available, Error: " + result);
              });
          }
        }

        GroupFormDialogCtrl.$inject = ['$scope', '$mdDialog', 'mode'];
        /* @ngInject */
        function GroupFormDialogCtrl($scope, $mdDialog, mode){
          $scope.dialogTitle = ((mode == 'add') ? 'Add New' : 'Edit') + ' Sub-Group';

          var selectedBranch = vm.communityTree.get_selected_branch();
          //var parentBranch = selectedBranch.select_parent_branch();
          // $log.info(selectedBranch);

          $scope.isSaveDisabled = true;
          $scope.mode = mode;

          if (mode == 'edit'){
            $scope.groupLabel = selectedBranch.label;
            $scope.groupDescription = selectedBranch.description;
            $scope.isSaveDisabled = false;
          }

          $scope.validateGroupForm = function(){
            if ($scope.groupLabel && $scope.groupLabel.length > 0){
              $scope.isSaveDisabled = false;
            } else {
              $scope.isSaveDisabled = true;
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
              var grpModel = {
                label: $scope.groupLabel,
                description: $scope.groupDescription
              };

              if (mode == 'add'){
                grpModel.level = Number(selectedBranch.level) + 1;
                grpModel.parentid = selectedBranch._id;
                grpModel.relationships = [];
                grpModel.profile_fields = [];

                insertSubGroup(grpModel);

              } else if (mode == 'edit'){
                grpModel.level = +selectedBranch.level;
                grpModel.parentid = selectedBranch._id;
                grpModel.relationships = selectedBranch.relationships;
                grpModel.profile_fields = selectedBranch.profile_fields;

                // console.log('selectedBranch.relationships',selectedBranch.relationships);
                // console.log('selectedBranch.profile_fields',selectedBranch.profile_fields);

                updateSubGroup(grpModel, selectedBranch._id);

              }

            }
            $mdDialog.hide(action);
          };

          function insertSubGroup(model) {
            vm.treeDataPromise = DataService.saveGroupData('insert', model);
            vm.treeDataPromise.then(function (result) {

              vm.communityTree.add_branch(selectedBranch, {
                _id: result.data.newId,
                label: $scope.groupLabel,
                description: $scope.groupDescription,
                level: model.level
              });

              // focus on the created sub-group
              searchTreeHandler($scope.groupLabel);
            }, function (result) {
              $log.error("Error on insertion of group data, Error: " + result);
            });
          }

          function updateSubGroup(model, id) {
            vm.treeDataPromise = DataService.saveGroupData('update', model, id);
            vm.treeDataPromise.then(function (result) {

              forEachBr(vm.treeData, function(t) {
                if (t._id == id){
                  t.label = $scope.groupLabel;
                  t.description = $scope.groupDescription;
                }
              });

              // focus on the created sub-group
              //searchTreeHandler($scope.groupLabel);
            }, function (result) {
              $log.error("Error on update of group data, Error: " + result);
            });
          }
        }

        function deleteSubArray(array, id, parent) {
          if (typeof array != 'undefined') {
            for (var i = 0; i < array.length; i++) {
              if (array[i]._id == id) {

                if (typeof array[i].children != 'undefined'){
                  parent.children.splice(i,1);
                  break;
                }

                return array[i];
              }
              var a = deleteSubArray(array[i].children, id, array[i]);
              if (a !== null) {
                  return a;
              }
            }
          }
          return null;
        }

        function getSubBranches (b, tree, s) {
          var next;
          var subs = s;

          if (b !== null) {
            next = tree.get_first_child(b);
            if (next !== null) {
              subs.push(next);
              return getSubBranches(next, tree, subs);
            } else {
              if (subs.length > 0){
                next = tree.get_next_sibling(b);
                if (next !== null) {
                  subs.push(next);
                  return getSubBranches(next, tree, subs);
                } else {
                  return subs;
                }
              }
            }
          } else {
            return subs;
          }
        }

        function forEachBr (treeObj, f) {
          var do_f, root_branch, _i, _len, _ref, _results;
          do_f = function(branch, level) {
            var child, _i, _len, _ref, _results;
            f(branch, level);
            if (branch.children !== null) {
              _ref = branch.children;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(do_f(child, level + 1));
              }
              return _results;
            }
          };
          _ref = treeObj;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            root_branch = _ref[_i];
            _results.push(do_f(root_branch, 1));
          }
          return _results;
        }
    }
})();
