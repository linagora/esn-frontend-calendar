(function() {
  'use strict';

  angular.module('esn.calendar')
    .service('calendarsCache', calendarsCache);

  function calendarsCache(_, CAL_OLD_DEFAULT_ID) {
    var calendarsCache = {};

    return {
      get: get,
      set: set,
      remove: remove,
      getList: getList,
      setList: setList
    };

    function get(calendarHomeId, calendarId) {
      createHomeIdCache(calendarHomeId);

      return (calendarId === CAL_OLD_DEFAULT_ID ?
        calendarsCache[calendarHomeId][calendarHomeId] :
        calendarsCache[calendarHomeId][calendarId]) || null;
    }

    function set(calendar) {
      createHomeIdCache(calendar.calendarHomeId);

      calendar.isOldDefaultCalendar() ?
        calendarsCache[calendar.calendarHomeId][calendar.calendarHomeId] = calendar :
        calendarsCache[calendar.calendarHomeId][calendar.id] = calendar;
    }

    function remove(calendarHomeId, calendarId) {
      var calendar = get(calendarHomeId, calendarId);

      if (calendar) {
        calendar.isOldDefaultCalendar() ?
          delete calendarsCache[calendarHomeId][calendarHomeId] :
          delete calendarsCache[calendarHomeId][calendarId];
      }
    }

    function getList(calendarHomeId) {
      return calendarsCache[calendarHomeId] || null;
    }

    function setList(calendars) {
      _.forEach(calendars, function(calendar) {
        set(calendar);
      });
    }

    function createHomeIdCache(calendarHomeId) {
      if (!calendarsCache[calendarHomeId]) {
        calendarsCache[calendarHomeId] = [];
      }
    }
  }
})();
