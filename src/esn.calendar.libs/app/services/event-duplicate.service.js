'use strict';

angular.module('esn.calendar.libs')
  .factory('calEventDuplicateService', calEventDuplicateService);

function calEventDuplicateService() {
  let sourceCalendarId = null;

  return {
    getDuplicateEventSource,
    setDuplicateEventSource,
    reset
  };

  /**
   * @return {String} The calendar id of the original event.
   */
  function getDuplicateEventSource() {
    return sourceCalendarId;
  }

  /**
   * @param {String} calendarId The calendar id of the original event.
   */
  function setDuplicateEventSource(calendarId) {
    sourceCalendarId = calendarId;
  }

  function reset() {
    sourceCalendarId = null;
  }
}
