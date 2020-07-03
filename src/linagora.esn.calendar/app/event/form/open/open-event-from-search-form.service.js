(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calOpenEventFromSearchForm', calOpenEventFromSearchForm);

  function calOpenEventFromSearchForm(_, CalendarShell, calendarAPI, ICAL, calEventFormService) {
    return function(eventFromSearch, relatedEvents) {
      var event = _.assign(eventFromSearch);
      var calendarHomeId = event.userId;
      var calendarId = event.calendarId;

      event.isPublic = function() {
        return event.class === 'PUBLIC';
      };

      event.isInstance = function() {
        return !!event.recurrenceId;
      };

      event.fetchFullEvent = _fetchFullEvent(event);

      calEventFormService.openEventForm(calendarHomeId, calendarId, event, relatedEvents);
    };

    ////////////

    function _fetchFullEvent(event) {
      return function() {
        return calendarAPI.getEventByUID(event.userId, event.uid).then(function(results) {
          var vcalendar = new ICAL.Component(results[0].data);
          var vevents = vcalendar.getAllSubcomponents('vevent');
          var vevent = vevents[0];

          if (event.recurrenceId) {
            vevent = _.find(vevents, function(currentVEVENT) {
              var recurrenceIdAsICALTime = currentVEVENT.getFirstPropertyValue('recurrence-id');

              if (!recurrenceIdAsICALTime) return false;

              return event.recurrenceId === recurrenceIdAsICALTime.toJSDate().toISOString().split('.')[0] + 'Z';
            });
          }

          return new CalendarShell(vevent, { path: results[0]._links.self.href, etag: results[0].etag });
        });
      };
    }
  }
})();
