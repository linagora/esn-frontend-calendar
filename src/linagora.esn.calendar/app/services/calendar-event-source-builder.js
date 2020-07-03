(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calendarEventSourceBuilder', calendarEventSourceBuilder);

  function calendarEventSourceBuilder(
    $log,
    calCachedEventSource,
    calendarEventSource
  ) {
    return function build(calendars) {
      var eventSources = {};

      calendars.forEach(function(calendar) {
        eventSources[calendar.getUniqueId()] = _buildEventSource(calendar);
      });

      return eventSources;
    };

    function _buildEventSource(calendar) {
      return calCachedEventSource.wrapEventSource(calendar, calendarEventSource(calendar, function(error) {
        $log.error('Could not retrieve event sources for calendar', calendar.getUniqueId(), error);
      }));
    }
  }
})(angular);
