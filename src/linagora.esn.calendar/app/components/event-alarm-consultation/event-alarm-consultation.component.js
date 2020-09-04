'use strict';

angular.module('esn.calendar')
  .component('calEventAlarmConsultation', {
    template: require('./event-alarm-consultation.pug'),
    bindings: {
      event: '='
    },
    controller: 'calEventAlarmConsultationController',
    controllerAs: 'ctrl'
  });
