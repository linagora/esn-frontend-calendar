(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalCalendarRootController', CalCalendarRootController);

    function CalCalendarRootController($scope, calendarService, calDefaultValue, calendarHomeId, businessHours) {
      var CAL_DEFAULT_OLD_CALENDAR_ID = 'events';

      $scope.calendarHomeId = calendarHomeId;
      $scope.businessHours = businessHours;

      calendarService.getCalendar(calendarHomeId, CAL_DEFAULT_OLD_CALENDAR_ID, true)
        .then(function(calendar) {
          return calendar && calendar.id;
        })
        .catch(function(err) {
          if (err && err.status === 404) {
            return calendarHomeId;
          }
        })
        .then(function(defaultCalId) {
          calDefaultValue.set('calendarId', defaultCalId || CAL_DEFAULT_OLD_CALENDAR_ID);
        });
    }
})();
