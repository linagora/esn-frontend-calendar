(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .controller('ESNResourceAdministratorListItemUserController', ESNResourceAdministratorListItemUserController);

    function ESNResourceAdministratorListItemUserController(userAPI) {
      var self = this;

      self.$onInit = $onInit;

      function $onInit() {
        userAPI.user(self.administrator.id).then(function(user) {
          self.administratorInfo = user.data;
        });
      }
    }
})(angular);
