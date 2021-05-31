'use strict';

angular.module('esn.calendar.libs')
  .component('calAttendeeList', {
    bindings: {
      attendees: '<',
      canModifyAttendees: '=',
      organizer: '=',
      subject: '=',
      onAttendeeRemoved: '&'
    },
    controller: 'CalAttendeeListController',
    controllerAs: 'ctrl',
    template: require('./attendee-list.pug')
  });
