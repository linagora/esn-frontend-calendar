(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarsListItems', {
      template: require("./calendars-list-items.pug"),
      controller: 'CalendarsListItemsController',
      bindings: {
        calendars: '=?',
        toggleCalendar: '=?',
        hiddenCalendars: '=?',
        showDetails: '=?'
      }
    });
})(angular);
