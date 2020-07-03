(function(angular) {
    'use strict';

    angular.module('esn.calendar')
      .controller('CalendarsListItemConfigurationController', CalendarsListItemConfigurationController);

    function CalendarsListItemConfigurationController($state) {
      var self = this;

      self.$onInit = $onInit;

      function $onInit() {
        self.onOptionClick = onOptionClick;
      }

      function onOptionClick() {
        $state.go('calendar.edit', { calendarUniqueId: self.calendarId });
      }
    }
  })(angular);
