'use strict';

angular.module('esn.calendar.libs')
.component('calAttendeeItem', {
  template: require("./attendee-item.pug"),
  bindings: {
    attendee: '=',
    canModifyAttendee: '=',
    isOrganizer: '=',
    remove: '&'
  },
  controller: 'CalAttendeeItemController',
  controllerAs: 'ctrl'
});