(function() {
  'use strict';

  angular.module('esn.calendar.event-error-display')
    .component('calEventExternalErrorDisplay', {
      bindings: {
        error: '<'
      },
      controllerAs: 'ctrl',
      templateUrl: '/calendar/app/error-display/error-display.html'
    });
})();
