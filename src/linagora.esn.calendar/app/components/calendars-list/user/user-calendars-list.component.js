(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calUserCalendarsList', {
      template: require("./user-calendars-list.pug"),
      bindings: {
        userCalendars: '=',
        toggleCalendar: '=',
        hiddenCalendars: '='
      }
    });
})();
