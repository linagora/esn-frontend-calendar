require('./calendar-header/calendar-sub-header.directive.js');
require('./calendar-view/calendar-view.directive.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendar', {
      template: require("./calendar.pug"),
      bindings: {
        calendarHomeId: '=',
        businessHours: '='
      },
      controllerAs: 'ctrl',
      controller: 'CalCalendarController'
  });
})(angular);
