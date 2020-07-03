(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('miniCalendarService', miniCalendarService);

  function miniCalendarService($q, calMoment) {
    var service = {
      forEachDayOfEvent: forEachDayOfEvent,
      getWeekAroundDay: getWeekAroundDay
    };

    return service;

    function forEachDayOfEvent(event, callback) {
      var day = calMoment(event.start);
      var end = calMoment(event.end || event.start);

      if (!(event.full24HoursDay && event.end)) {
        end.add(1, 'days');
      }

      // avoid infinite loop if for some nasty reason end has been set to a date before start
      if (day.isAfter(end)) {
        return callback(calMoment(day));
      }

      //subtract one minute if the event finish at midnight to fix the condition day.isSame(end, 'day')
      if (!event.full24HoursDay && event.end && event.end.hour() === 0 && event.end.minute() === 0) {
        end.subtract(1, 'minutes');
      }

      while (!day.isSame(end, 'day')) {
        callback(calMoment(day));
        day.add(1, 'days');
      }
    }

    function getWeekAroundDay(calendarConfig, day) {
      var firstDay = calendarConfig.firstDay;

      //if no firstDay default in config, I assume local of moment
      //is the same as fullcalendar local for first day of the week
      var firstWeekDay = firstDay ?
        calMoment(day).isoWeekday(firstDay) : calMoment(day).weekday(0);

      if (firstWeekDay.isAfter(day)) {
        firstWeekDay.subtract(7, 'days');
      }

      var nextFirstWeekDay = calMoment(firstWeekDay).add(7, 'days');

      return {
        firstWeekDay: firstWeekDay,
        nextFirstWeekDay: nextFirstWeekDay
      };
    }
  }
})();
