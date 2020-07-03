(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarConfiguration', {
      template: require("./calendar-configuration.pug"),
      controller: 'calendarConfigurationController'
    });
})();
