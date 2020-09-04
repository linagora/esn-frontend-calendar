require('./mini-calendar.controller');
require('../calendar/calendar.component.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('miniCalendar', miniCalendar);

  function miniCalendar() {
    var directive = {
      restrict: 'E',
      template: require('./mini-calendar.pug'),
      scope: {
        calendarHomeId: '='
      },
      replace: true,
      controller: 'miniCalendarController'
    };

    return directive;
  }

})(angular);
