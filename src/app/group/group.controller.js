(function () {
  'use strict';

  angular
    .module('secretSantaFirebase')
    .controller('GroupController', GroupController);

  /** @ngInject */
  function GroupController($rootScope, toastr, UserService, FirebaseService, users, $stateParams, Auth) {

    var vm = this;
    vm.users = users;
    vm.user = UserService.current;


    //methods
    vm.removeUser = removeUser;
    vm.generateAssignments = generateAssignments;


    function removeUser(user) {
      var updateData = {};

      updateData['userGroups/'+user.$id+'/'+$stateParams.groupId] = null;
      updateData['groupUsers/'+$stateParams.groupId+'/'+user.$id] = null;

      firebase.database().ref().update(updateData);
    }

    function generateAssignments() {
      FirebaseService.getUsersByGroup($stateParams.groupId).$loaded().then(function (res) {
        var usersToAssign = [];
        var usersToChoose = [];

        for(var i = 0; i < res.length; i++){
          usersToAssign.push(res[i].$id);
          usersToChoose.push(res[i].$id);
        }

        generateData(usersToAssign,usersToChoose);

      });
    }

    function generateData(usersToAssign, usersToChoose) {

      if(usersToAssign.length < 2){
        toastr.error('მომხმარებელთა რაოდენობა არასაკმარისია','შეცდომა');
        return;
      }
      var updateData = null;
      var reset = 0;
      while(updateData == null && reset < 5){
        updateData = randomize(angular.copy(usersToAssign),angular.copy(usersToChoose));
        reset++;
      }
      if(reset == 5){
        toastr.error('დაგენერირება ვერ მოხერხდა','შეცდომა');
        return;
      }
      firebase.database().ref('assigned/' + $stateParams.groupId).update(updateData);
    }

    function randomize(assign, choose) {
      var updateData = {};
      for(var i = 0; i < assign.length; i++){
        var choosedUser = null;
        var reset = 0;
        while(choosedUser == null && choose.length > 0 && reset < 5){
          var index = Math.floor(Math.random() * (choose.length - 1 + 1)) + 0;
          var chosen = choose[index];
          if(chosen == assign[i]){
            reset++;
          }else{
            choosedUser = chosen;
            choose.splice(index,1);
          }
        }
        if(reset == 5){
          return null;
        }else{
          updateData[assign[i]] = choosedUser;
        }
      }

      return updateData;
    }
      // firebase.database().ref('groupUsers').push().set(data);
  }
})();
