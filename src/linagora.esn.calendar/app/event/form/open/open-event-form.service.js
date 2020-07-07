require('../../../services/cal-default-value.service.js');
require('../../../services/event-utils.js');
require('../../../event/form/open/event-form.service.js');

(function(angular) {
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
})(angular);
