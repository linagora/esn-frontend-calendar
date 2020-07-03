(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calOpenEventForm', calOpenEventForm);

  function calOpenEventForm(calDefaultValue, calEventUtils, calEventFormService) {
    return function calOpenEventForm(fallbackCalendarHomeId, event, relatedEvents) {
      var calendarHomeId = calEventUtils.isNew(event) ? fallbackCalendarHomeId : event.calendarHomeId;
      var calendarId = calEventUtils.isNew(event) ? calDefaultValue.get('calendarId') : event.calendarId;

      calEventFormService.openEventForm(calendarHomeId, calendarId, event, relatedEvents);
    };
  }
})();
