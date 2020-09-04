(function(angular) {
  'use strict';

  angular
    .module('esn.calendar')
    .component('calendarTodayButton', {
      bindings: {
        isCurrentViewAroundToday: '&'
      },
      template: require('./calendar-today-button.pug'),
      controller: 'CalendarTodayButtonController'
    });
})(angular);
