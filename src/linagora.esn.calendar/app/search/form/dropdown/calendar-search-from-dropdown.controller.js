(function(angular) {
  'use strict';

  angular.module('esn.calendar').controller('calendarSearchFormDropdownController', calendarSearchFormDropdownController);

  function calendarSearchFormDropdownController(CAL_ADVANCED_SEARCH_CALENDAR_TYPES) {
    var self = this;

    self.calendarTypes = CAL_ADVANCED_SEARCH_CALENDAR_TYPES;
  }
})(angular);
