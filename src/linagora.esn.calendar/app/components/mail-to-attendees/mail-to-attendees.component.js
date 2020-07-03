'use strict';

angular.module('esn.calendar')

  .component('calMailToAttendees', {
    template: require("./mail-to-attendees.pug"),
    controller: 'calMailToAttendeesController',
    controllerAs: 'ctrl',
    bindings: {
      event: '='
    }
  });
