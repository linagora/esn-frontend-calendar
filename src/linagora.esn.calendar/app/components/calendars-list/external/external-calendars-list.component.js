(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calExternalCalendarsList', {
      template: require('./external-calendars-list.pug'),
      bindings: {
        sharedCalendars: '=',
        publicCalendars: '=',
        toggleCalendar: '=',
        hiddenCalendars: '='
      }
    });
})(angular);
