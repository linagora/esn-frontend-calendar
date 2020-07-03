(function() {
  'use strict';

  angular.module('esn.calendar')
   .component('calendarsList', {
      template: require("./calendars-list.pug"),
      controller: 'CalendarsListController'
    });
})();
