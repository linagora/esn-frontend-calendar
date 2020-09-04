(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendarsListItem', {
      template: require('./calendars-list-item.pug'),
      controller: 'CalendarsListItemController',
      bindings: {
        calendar: '<',
        onShowHideToggle: '&',
        selected: '<',
        showDetails: '<'
      }
    });
})(angular);
