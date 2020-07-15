(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calAttendeeAvatarExternal', {
      template: require("./attendee-avatar-external.pug"),
      bindings: {
        attendee: '<',
        isOrganizer: '<'
      },
      controllerAs: 'ctrl',
      controller: 'CalAttendeeExternalAvatarController'
    });
})(angular);
