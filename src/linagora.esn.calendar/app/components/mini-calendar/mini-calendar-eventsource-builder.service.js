(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calMiniCalendarEventSourceBuilderService', calMiniCalendarEventSourceBuilderService);

  function calMiniCalendarEventSourceBuilderService(
    $q,
    _,
    miniCalendarService,
    calendarEventSourceBuilder,
    calMoment,
    CAL_MINI_CALENDAR_DAY_FORMAT
  ) {

    return function build(calendar, calendars) {
      return {
        events: groupByDay(calendar, calendars)
      };
    };

    function groupByDay(calendar, calendars) {
      var eventSources = calendarEventSourceBuilder(calendars);

      return function(start, end, timezone, callback) {
        var eventsPromise = [];
        var originalEvents = {};
        var fakeEvents = {};

        _.forEach(eventSources, function(calendarEventSource) {
          var deferred = $q.defer();

          eventsPromise.push(deferred.promise);
          calendarEventSource(start, end, timezone, deferred.resolve);
        });

        $q.all(eventsPromise).then(function(listOfEvents) {
          _.flatten(listOfEvents).forEach(addOrDeleteEvent.bind(null, true));
          calendar.fullCalendar('removeEvents');
          callback(_.values(fakeEvents));
        });

        function addOrDeleteEvent(add, event) {
          if (add) {
            originalEvents[event.id] = {
              id: event.id,
              start: calMoment(event.start),
              end: event.end && calMoment(event.end),
              allDay: event.allDay
            };
          } else {
            delete originalEvents[event.id];
          }

          miniCalendarService.forEachDayOfEvent(event, function(day) {
            var date = day.format(CAL_MINI_CALENDAR_DAY_FORMAT);
            var dayEvent = fakeEvents[date];

            if (!dayEvent) {
              dayEvent = fakeEvents[date] = {
                start: date,
                id: date,
                _num: 0,
                allDay: true
              };
            }

            dayEvent._num = dayEvent._num + (add ? 1 : -1);
            dayEvent.title = dayEvent._num > 99 ? '99+' : ('' + dayEvent._num);
          });
        }
      };
    }
  }
})(angular);
