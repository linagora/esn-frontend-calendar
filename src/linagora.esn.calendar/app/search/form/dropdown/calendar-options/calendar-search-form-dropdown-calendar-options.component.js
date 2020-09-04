(function(angular) {
  'use strict';

  angular.module('esn.calendar').component('calendarSearchFormDropdownCalendarOptions', {
    template: require('./calendar-search-form-dropdown-calendar-options.pug'),
    bindings: {
      calendarList: '<'
    }
  });
})(angular);
