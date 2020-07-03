'use strict';

angular.module('esn.calendar')
  .component('calEventParticipation', {
    controllerAs: 'ctrl',
    bindings: {
      changeParticipation: '=',
      userAsAttendee: '<'
    },
    template: require("./event-participation.pug")
  });
