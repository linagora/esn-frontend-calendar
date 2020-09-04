'use strict';

angular.module('esn.calendar.libs')
  .component('calEventAlarmEdition', {
    template: require('./event-alarm-edition.pug'),
    bindings: {
      event: '=',
      canModifyEvent: '=?'
    },
    controller: 'calEventAlarmEditionController',
    controllerAs: 'ctrl'
  });
