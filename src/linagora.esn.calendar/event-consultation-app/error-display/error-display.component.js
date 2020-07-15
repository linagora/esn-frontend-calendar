(function(angular) {
  'use strict';

  angular.module('esn.calendar.event-error-display')
    .component('calEventExternalErrorDisplay', {
      bindings: {
        error: '<'
      },
      controllerAs: 'ctrl',
      template: require('./error-display.pug')
    });
})(angular);
