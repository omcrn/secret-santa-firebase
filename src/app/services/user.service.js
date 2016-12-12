/**
 * Created by zura on 12/12/16.
 */
(function () {
  'use strict';

  'use strict';

    angular
        .module('secretSantaFirebase')
        .factory('UserService', UserService);

    /** @ngInject */
    function UserService(Auth, $rootScope, $log) {
        var users = {
            current: null
        };

        Auth.$onAuthStateChanged(function (firebaseUser) {
            users.current = firebaseUser;
            $rootScope.$emit('userStateChange', firebaseUser);
            $log.debug("User state has been changed. Current User: ", firebaseUser);
        });

        return users;
    }
})();