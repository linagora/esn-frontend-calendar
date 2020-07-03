(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('esnCalendar', {
      controller: 'esnCalendarController',
      bindings: {
        config: '<',
        calendarReady: '<'
      },
      template: '<div></div>'
    });
})(angular);
