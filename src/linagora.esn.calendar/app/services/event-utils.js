(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calEventUtils', calEventUtils);

  function calEventUtils(
    _,
    session,
    moment,
    esnI18nService,
    CAL_DEFAULT_EVENT_COLOR,
    CAL_SIGNIFICANT_CHANGE_KEYS,
    CAL_EVENT_FORM
  ) {
    var editedEvent = null;
    var newAttendees = [];
    var newResources = [];

    var service = {
      editedEvent: editedEvent,
      isNew: isNew,
      isInvolvedInATask: isInvolvedInATask,
      isOrganizer: isOrganizer,
      hasSignificantChange: hasSignificantChange,
      hasAttendees: hasAttendees,
      hasAnyChange: hasAnyChange,
      getEditedEvent: getEditedEvent,
      setEditedEvent: setEditedEvent,
      getNewAttendees: getNewAttendees,
      getNewResources: getNewResources,
      setNewAttendees: setNewAttendees,
      setNewResources: setNewResources,
      setBackgroundColor: setBackgroundColor,
      resetStoredEvents: resetStoredEvents,
      getUserAttendee: getUserAttendee,
      getEventTitle: getEventTitle,
      canSuggestChanges: canSuggestChanges,
      stripTimeWithTz: stripTimeWithTz
    };

    return service;

    ////////////

    /**
     * Return true or false either the event is new (not in caldav yet) or not.
     * We are using dtstamp which only events that already exist in caldav have.
     * @param  {CalendarShell|Object}  event the event to check (can be either a CalendarShell or an event object from Elasticsearch)
     * @return {Boolean}        true if event is not yet on the server, false otherwise
     */
    function isNew(event) {
      return !event.dtstamp;
    }

    /**
     * Return true or false either the event is involved in a graceperiod task
     * @param  {CalendarShell}  event the event to checkbox
     * @return {Boolean}
     */
    function isInvolvedInATask(event) {
      return !angular.isUndefined(event.gracePeriodTaskId);
    }

    function isOrganizer(event, user) {
      var organizerMail = event && event.organizer && (event.organizer.email || event.organizer.emails[0]);

      user = user || session.user;

      return !organizerMail || _.contains(user.emails, organizerMail);
    }

    function hasSignificantChange(oldEvent, newEvent) {
      return !oldEvent.equals(newEvent, CAL_SIGNIFICANT_CHANGE_KEYS);
    }

    function hasAnyChange(oldEvent, newEvent) {
      return !oldEvent.equals(newEvent);
    }

    function hasAttendees(event) {
      return angular.isArray(event.attendees) && event.attendees.length > 0;
    }

    function getNewAttendees() {
      return newAttendees;
    }

    function setNewAttendees(attendees) {
      newAttendees = angular.copy(attendees);
    }

    function getNewResources() {
      return newResources;
    }

    function setNewResources(resources) {
      newResources = angular.copy(resources);
    }

    function getEditedEvent() {
      return editedEvent;
    }

    function setEditedEvent(event) {
      editedEvent = event;
    }

    function resetStoredEvents() {
      editedEvent = {};
      newAttendees = [];
      newResources = [];
    }

    function setBackgroundColor(event, calendars) {
      event.backgroundColor = (_.find(calendars, {id: event.calendarId}) || {color: CAL_DEFAULT_EVENT_COLOR}).color;

      return event;
    }

    function getUserAttendee(event, user) {
      user = user || session.user;

      return _.find(event.attendees, function(attendee) {
        return _.contains(user.emails, attendee.email);
      });
    }

    function getEventTitle(event) {
      var title = event.title ? event.title.trim() : CAL_EVENT_FORM.title.empty;

      return title.trim() === CAL_EVENT_FORM.title.empty ? esnI18nService.translate(CAL_EVENT_FORM.title.default) : title;
    }

    function canSuggestChanges(event, user) {
      return !!(!event.isRecurring() && !isOrganizer(event, user) && getUserAttendee(event, user));
    }

    function stripTimeWithTz(calMomentDate, shouldNotSubtractUTCOffset) {
      var timeStrippedMoment = calMomentDate.clone();
      // Due to FullCalendar v3 timezone bugs (https://github.com/fullcalendar/fullcalendar/issues/2981),
      // we're only using browser timezone here. After we've successfully migrated to FullCalendar v4,
      // it has to be the user's chosen timezone: `var currentUTCOffset = moment().tz(esnDatetimeService.getTimezone()).utcOffset()`.
      var currentUTCOffset = moment().utcOffset();

      // If the user is in a timezone with negative UTC offset, we need to subtract the UTC offset from
      // the moment to ensure that it is still the same day when converting to and from UTC-00.
      if (currentUTCOffset < 0 && !shouldNotSubtractUTCOffset) {
        var subtractedMoment = timeStrippedMoment.clone().subtract(currentUTCOffset, 'minutes');

        if (subtractedMoment.isSame(timeStrippedMoment, 'day')) {
          timeStrippedMoment = subtractedMoment.clone();
        }
      }

      // This is to make m.hasTime() return false, which is a workaround due to FullCalendar v3 timezone bugs.
      // See https://github.com/fullcalendar/fullcalendar/blob/v3/src/moment-ext.ts#L231 for details.
      timeStrippedMoment._ambigTime = true;

      return timeStrippedMoment;
    }
  }

})();
