(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calUserCalendarsList', {
      template: require('./user-calendars-list.pug'),
      controller: 'UserCalendarsListController',
      bindings: {
        userCalendars: '=',
        toggleCalendar: '=',
        hiddenCalendars: '=',
        selectAllCalendars: '=',
        calendarsToggled: '<',
        lengthUserCalendars:'='
      }
    });
})(angular);
