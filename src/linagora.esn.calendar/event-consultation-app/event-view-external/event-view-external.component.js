(function() {
  'use strict';

  angular.module('esn.calendar')
  .component('calEventViewExternal', {
    bindings: {
      eventJcal: '<',
      attendeeEmail: '@',
      links: '<'
    },
    controller: 'CalEventViewExternalController',
    controllerAs: 'ctrl',
    template: '<cal-event-view event="ctrl.event", external-attendee="ctrl.externalAttendee", links="ctrl.links"/>'
  });
})();
