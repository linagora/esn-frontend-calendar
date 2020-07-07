(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calAttendeeAvatar', {
      template: require("./attendee-avatar.pug"),
      bindings: {
        attendee: '<'
      },
      controllerAs: 'ctrl',
      controller: 'CalAttendeeAvatarController'
    });
})(angular);
