'use strict';

angular.module('esn.calendar.libs')
  .factory('calEventDuplicateService', calEventDuplicateService);

function calEventDuplicateService(
  $log,
  $q,
  CalendarShell,
  VideoConfConfigurationService,
  uuid4,
  notificationFactory,
  CAL_EVENT_DUPLICATE_KEYS,
  CAL_ICAL
) {
  let sourceCalendarId = null;

  return {
    getDuplicateEventSource,
    setDuplicateEventSource,
    reset,
    duplicateEvent
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

  function duplicateEvent(event) {
    // Build an event copy based on the currently edited event.
    const duplicate = _generateEventCopy(event);

    // Set the alarm if there was any
    // alarm can't be set with CalendarShell.fromIncompleteShell because the event needs to be created or cloned first.
    if (event.alarm && event.alarm.trigger && event.alarm.attendee) {
      duplicate.alarm = event.alarm;
    }

    // Reset the partstat from the original event.
    _resetAttendeesParticipation(duplicate);

    // Check and set a new video conference link if needed.
    if (duplicate && duplicate.xOpenpaasVideoconference) {
      // Wait for the VideoConfConfigurationService to generate a link.
      return _generateVideoConferenceUrl().then(url => {
        duplicate.xOpenpaasVideoconference = url;

        return duplicate;
      });
    }

    return $q.when(duplicate);
  }

  function _generateEventCopy(event) {
    const details = CAL_EVENT_DUPLICATE_KEYS
      .reduce((details, key) => (event[key] ? { [key]: event[key], ...details } : details), {});

    return CalendarShell.fromIncompleteShell(details);
  }

  function _generateVideoConferenceUrl() {
    return VideoConfConfigurationService.getOpenPaasVideoconferenceAppUrl()
      .then(openPaasVideoconferenceAppUrl => `${openPaasVideoconferenceAppUrl}${uuid4.generate()}`)
      .catch(err => {
        $log.error('Cannot generate a new video conference URL', err);

        notificationFactory.weakError(null, 'Failed to create a new video conference room');
      });
  }

  function _resetAttendeesParticipation(event) {
    if (!event || !event.attendees) return;

    event.attendees = event.attendees.map(attendee => {
      // Ignore resources
      if (attendee && attendee.cutype !== CAL_ICAL.cutype.resource) {
        return { ...attendee, partstat: CAL_ICAL.partstat.needsaction };
      }

      return attendee;
    });
  }
}
