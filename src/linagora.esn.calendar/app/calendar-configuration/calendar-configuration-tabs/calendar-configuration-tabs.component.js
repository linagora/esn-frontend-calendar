(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarConfigurationTabs', calendarConfigurationTabs());

  ////////////

  function calendarConfigurationTabs() {
    return {
      template: require("./calendar-configuration-tabs.pug"),
      bindings: {
        selectedTab: '=',
        newCalendar: '=',
        calendar: '='
      },
      controller: 'CalendarConfigurationTabsController'
    };
  }
})();
