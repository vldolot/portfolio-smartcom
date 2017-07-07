(function() {
    'use strict';

    angular
        .module('app.services')
        .controller('BroadcastController', BroadcastController);

    BroadcastController.$inject = ['$q', '$scope', '$log', '$mdDialog', '$timeout'];

    /* @ngInject */
    function BroadcastController($q, $scope, $log, $mdDialog, $timeout) {
        var vm = this;
        vm.title = 'My Services - Broadcast';
        vm.isOpen = false;

        vm.message = {
          contacts: [],
          sendername: null,
          body: null,
          optout: null
        };

        vm.senderNames = [
          {
            key: 'sample_sender_name',
            value: 'Sample Sender Name'
          },
          {
            key: 'smart_communications',
            value: 'Smart Communications'
          }
        ];

        // Contacts Chip handlers
        vm.contactsChipAction = contactsChipActionHandler;
        vm.selectedContactChange = onSelectedContactChange;
        vm.contactSearchTextChange = onContactSearchTextChange;
        vm.querySearch = onQuerySearch;

        vm.showMessagePreview = showMessagePreview;

        activate();

        ////////////////

        function activate() {
          $log.info('Activated My Services - Broadcast View');

          // loadGroups();
          // loadUsers();
        }

        function contactsChipActionHandler(action, chip, idx) {
          if (action === 'select'){
            vm.selectedChip = chip;
          }
        }

        function onSelectedContactChange (item, ev) {
          if (item && item.is_assigned){
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Warning!')
                .textContent('You selected a user that is already assigned as recipient. This user will not be added.')
                .ariaLabel('Alert Dialog')
                .ok('Ok')
                .targetEvent(ev)
            ).then(function() {
              vm.message.contacts.pop();
            });
          }
        }

        function onContactSearchTextChange(text) {
          // body...
        }

        function onQuerySearch(query) {
          // var results = $filter('filter')(vm.allMembers, query);
          // results = $filter('orderBy')(results, 'is_assigned');

          // return results.filter(function(member) {
          //   return (
          //     (angular.lowercase(member.email_address).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1 ||
          //     angular.lowercase(member.mobile_number).indexOf(angular.lowercase(vm.searchSelectedMembers) || '') !== -1) &&
          //     vm.membersChips.indexOf(member) === -1
          //   );
          // });
        }

        function showMessagePreview (mode, ev) {
          switch (mode) {
            case 'later':
              $mdDialog.show({
                  controller: 'ScheduleSMSDialogCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'app/myservices/schedule-sms-dialog-tmpl.html',
                  targetEvent: ev,
                  clickOutsideToClose:true,
                  bindToController: true,
                  locals: { mode: mode, parent: vm }
              })
              .then(function(btnAction) {
                //$state.reload();

                //$log.info('You clicked the "' + btnAction + '" button.');
              }, function() {
                $log.info('You cancelled the dialog.');
              });
              break;

            case 'bulk':
              break;

            default:
              $mdDialog.show({
                  controller: 'MessagePreviewDialogCtrl',
                  controllerAs: 'vm',
                  templateUrl: 'app/myservices/message-preview-dialog-tmpl.html',
                  targetEvent: ev,
                  clickOutsideToClose:true,
                  bindToController: true,
                  locals: { mode: mode, parent: vm }
              })
              .then(function(btnAction) {
                //$state.reload();

                //$log.info('You clicked the "' + btnAction + '" button.');
              }, function() {
                $log.info('You cancelled the dialog.');
              });
              break;
          }
        }

    }
})();
