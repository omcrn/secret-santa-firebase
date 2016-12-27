(function () {
  'use strict';

  angular
    .module('secretSantaFirebase')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($rootScope, UserService, FirebaseService, $state, Auth, $mdDialog) {
    var vm = this;

    vm.isLogedIn = true;
    vm.isOwner = true;
    vm.user = UserService.current;
    vm.groupName = null;
    vm.groups = FirebaseService.getGroupsByUser(vm.user.uid);

    // methods
    vm.createGroup = createGroup;
    vm.openGroup = openGroup;
    vm.removeGroup = removeGroup;
    vm.logOut = logOut;
    vm.copyGroupLink = copyGroupLink;

    function createGroup() {
      console.log(vm.groupName);
      var dataGroups = {
        'name': vm.groupName,
        'creatorId': vm.user.uid
      };


      var groupRef = firebase.database().ref('groups').push();
      var groupId = groupRef.getKey();

      var updateData = {};
      updateData['groups/' + groupId] = dataGroups;
      updateData['userGroups/' + vm.user.uid + '/' + groupId] = dataGroups;
      console.log(updateData);
      firebase.database().ref().update(updateData);


      UserService.saveUserData('groupUsers/' + '/' + groupId + '/' + vm.user.uid, vm.user);

      vm.recentName = vm.groupName;
      vm.groupName = null;
      vm.recentUrl = getGroupLink(groupId);
      // firebase.database().ref('groupUsers').push().set(data);

    }

    function logOut() {
      Auth.$signOut();
    }

    function openGroup(group) {
      $state.go('app.group', {'groupId': group.$id});
    }

    function removeGroup(group) {
      var groupId = group.$id;
      FirebaseService.getUsersByGroup(groupId).$loaded().then(function (res) {

        var updateData = {};
        for (var i = 0; i < res.length; i++) {
          updateData['userGroups/' + res[i].$id + '/' + groupId] = null;
        }
        updateData['groupUsers/' + groupId] = null;
        updateData['groups/' + groupId] = null;

        firebase.database().ref().update(updateData);

      });

    }

    function copyGroupLink(group) {
      $mdDialog.show({
          clickOutsideToClose: true,
          templateUrl: 'app/main/dialogs/copy-dialog/copy-dialog.html',
          controller: 'CopyDialogController',
          controllerAs: 'vm',
          locals: {
            Link: getGroupLink(group.$id)
          }
        }
      );
    }

    function getGroupLink(id) {
      var url = window.location.href;
      var arr = url.split("/");
      return arr[0] + "//" + arr[2] + '/#/join-game/' + id;
    }
  }
})();
