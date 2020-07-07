(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarConfigurationTabMain', calendarConfigurationTabMain());

  ////////////

  function calendarConfigurationTabMain() {
    return {
      template: require("./calendar-configuration-tab-main.pug"),
      bindings: {
        calendar: '=',
        calendarHomeId: '=',
        newCalendar: '=',
        publicSelection: '='
      },
      controller: 'CalendarConfigurationTabMainController'
    };
  }
})(angular);
