'use strict';

angular.module('esn.calendar.libs')
  .component('calAttendeeAvatar', {
    template: require("./attendee-avatar.pug"),
    bindings: {
      attendee: '<'
    },
    controllerAs: 'ctrl',
    controller: 'CalAttendeeAvatarController'
  });