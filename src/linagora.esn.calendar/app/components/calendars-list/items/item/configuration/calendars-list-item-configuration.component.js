(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendarsListItemConfiguration', {
      template: require('./configuration-list.pug'),
      controller: 'CalendarsListItemConfigurationController',
      bindings: {
        calendarId: '='
      }
    });
})(angular);
