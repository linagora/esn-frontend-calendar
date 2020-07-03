(function(angular) {
  'use strict';

  angular.module('esn.calendar').component('calendarSearchFormDropdown', {
    template: require("./calendar-search-form-dropdown.pug"),
    controller: 'calendarSearchFormDropdownController',
    bindings: {
      calendars: '<',
      selectedCal: '='
    }
  });
})(angular);
