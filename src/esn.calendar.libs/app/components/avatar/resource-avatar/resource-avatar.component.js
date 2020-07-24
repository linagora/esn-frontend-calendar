'use strict';

angular.module('esn.calendar.libs')
  .component('calResourceAvatar', {
    template: require("./resource-avatar.pug"),
    bindings: {
      resource: '<'
    },
    controllerAs: 'ctrl',
    controller: 'CalResourceAvatarController'
  });