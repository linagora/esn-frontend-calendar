(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarsListItemConfigurationController', CalendarsListItemConfigurationController);

  function CalendarsListItemConfigurationController(
    $state,
    calendarVisibilityService
  ) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.onOptionClick = onOptionClick;
    }

    function onOptionClick() {
      $state.go('calendar.main.edit', { calendarUniqueId: self.calendarId });
    }
  }
})(angular);
