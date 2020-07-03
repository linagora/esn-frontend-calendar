(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calEventExternalUserView', {
      bindings: {
        event: '<',
        attendees: '<',
        externalAttendee: '<',
        links: '<'
      },
      controller: 'CalEventViewExternalUserController',
      controllerAs: 'ctrl',
      template: require("../event-view-body.pug")
    });
})();
