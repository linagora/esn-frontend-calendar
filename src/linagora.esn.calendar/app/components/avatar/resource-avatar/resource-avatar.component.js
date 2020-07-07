(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calResourceAvatar', {
      template: require("./resource-avatar.pug"),
      bindings: {
        resource: '<'
      },
      controllerAs: 'ctrl',
      controller: 'CalResourceAvatarController'
    });
})(angular);
