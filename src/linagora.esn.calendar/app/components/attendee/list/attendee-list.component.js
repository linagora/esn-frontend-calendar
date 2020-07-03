(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calAttendeeList', {
      bindings: {
        attendees: '<',
        canModifyAttendees: '=',
        organizer: '=',
        onAttendeeRemoved: '&'
      },
      controller: 'CalAttendeeListController',
      controllerAs: 'ctrl',
      template: require("./attendee-list.pug")
    });
})();
