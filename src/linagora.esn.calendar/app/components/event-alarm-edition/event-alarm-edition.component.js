(function(angular) {
'use strict';

angular.module('esn.calendar')
  .component('calEventAlarmEdition', {
    template: require("./event-alarm-edition.pug"),
    bindings: {
      event: '=',
      canModifyEvent: '=?'
    },
    controller: 'calEventAlarmEditionController',
    controllerAs: 'ctrl'
  });
})(angular);
