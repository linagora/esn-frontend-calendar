'use strict';

angular.module('esn.calendar')
  .component('calEventDateConsultation', {
    template: require("./event-date-consultation.pug"),
    controller: 'calEventDateConsultationController',
    controllerAs: 'ctrl',
    bindings: {
      event: '='
    }
  });
