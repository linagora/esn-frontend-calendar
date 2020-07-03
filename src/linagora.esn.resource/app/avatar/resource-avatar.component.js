(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource').component('esnResourceAvatar', {
    bindings: {
      resource: '<'
    },
    controllerAs: 'ctrl',
    controller: 'esnResourceAvatarController',
    template: require("./resource-avatar.pug")
  });
})(angular);
