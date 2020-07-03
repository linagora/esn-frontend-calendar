(function() {
  'use strict';

  angular.module('esn.calendar')
    .directive('miniCalendar', miniCalendar);

  function miniCalendar() {
    var directive = {
      restrict: 'E',
      template: require("./mini-calendar.pug"),
      scope: {
        calendarHomeId: '='
      },
      replace: true,
      controller: 'miniCalendarController'
    };

    return directive;
  }

})();
