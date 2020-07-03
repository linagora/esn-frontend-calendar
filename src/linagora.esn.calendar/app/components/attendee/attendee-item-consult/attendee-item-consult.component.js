(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calAttendeeItemConsult', {
      bindings: {
        attendee: '=',
        isOrganizer: '<',
        isExternal: '<'
      },
      controllerAs: 'ctrl',
      controller: 'CalAttendeeItemConsultController',
      template: require("./attendee-item-consult.pug")
    });
})();
