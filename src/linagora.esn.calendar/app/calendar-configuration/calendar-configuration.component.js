require('./calendar-configuration-header/calendar-configuration-header.directive.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarConfiguration', {
      template: require("./calendar-configuration.pug"),
      controller: 'calendarConfigurationController'
    });
})(angular);
