angular.module('esn.calendar')
  .controller('CalRefreshCalendarButtonController', CalRefreshCalendarButtonController);

function CalRefreshCalendarButtonController($rootScope, calCachedEventSource, CAL_EVENTS) {
  const self = this;

  self.refreshCalendar = refreshCalendar;

  function refreshCalendar() {
    calCachedEventSource.resetCache();
    $rootScope.$broadcast(CAL_EVENTS.CALENDAR_REFRESH);
  }
}
