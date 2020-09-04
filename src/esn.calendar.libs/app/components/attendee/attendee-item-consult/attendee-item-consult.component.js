'use strict';

angular.module('esn.calendar.libs')
  .component('calAttendeeItemConsult', {
    bindings: {
      attendee: '=',
      isOrganizer: '<',
      isExternal: '<'
    },
    controllerAs: 'ctrl',
    controller: 'CalAttendeeItemConsultController',
    template: require('./attendee-item-consult.pug')
  });
