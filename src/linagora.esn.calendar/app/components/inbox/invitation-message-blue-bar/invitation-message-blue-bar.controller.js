(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('calInboxInvitationMessageBlueBarController', calInboxInvitationMessageBlueBarController);

  function calInboxInvitationMessageBlueBarController(
    $q,
    $log,
    calEventService,
    calendarHomeService,
    calEventUtils,
    calMoment,
    notificationFactory,
    calOpenEventForm,
    calEventDateSuggestionModal,
    calPartstatUpdateNotificationService,
    session,
    INVITATION_MESSAGE_HEADERS,
    CAL_EVENT_METHOD,
    CAL_RELATED_EVENT_TYPES
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.CAL_EVENT_METHOD = CAL_EVENT_METHOD;
    self.showDateSuggestionWindow = showDateSuggestionWindow;
    self.openEvent = openEvent;
    self.onPartstatChangeSuccess = onPartstatChangeSuccess;
    self.onPartstatChangeError = onPartstatChangeError;
    self.isActionable = isActionable;

    function $onInit() {
      self.meeting = {
        method: self.message.headers[INVITATION_MESSAGE_HEADERS.METHOD] || CAL_EVENT_METHOD.REQUEST,
        uid: self.message.headers[INVITATION_MESSAGE_HEADERS.UID],
        recurrenceId: self.message.headers[INVITATION_MESSAGE_HEADERS.RECURRENCE_ID],
        sequence: self.message.headers[INVITATION_MESSAGE_HEADERS.SEQUENCE] || '0'
      };

      load();
    }

    function load() {
      calendarHomeService.getUserCalendarHomeId()
        .then(bindCalendarHomeId)
        .then(getEventByUID)
        .then(selectEvent, handleNonExistentEvent)
        .then(assertEventInvolvesCurrentUser)
        .then(assertInvitationSequenceIsNotOutdated)
        .then(bindEventToController)
        .then(bindReplyAttendeeToController)
        .then(bindCanSuggestChanges)
        .then(fetchAdditionalData)
        .catch(handleErrorOrInvalidMeeting)
        .finally(function() {
          self.meeting.loaded = true;
        });
    }

    function bindCalendarHomeId(calendarId) {
      self.userCalendarHomeId = calendarId;
    }

    function bindCanSuggestChanges() {
      self.canSuggestChanges = calEventUtils.canSuggestChanges(self.event, session.user);
    }

    function showDateSuggestionWindow() {
      calEventDateSuggestionModal(self.event);
    }

    function onPartstatChangeSuccess(event) {
      $q.when(event)
        .then(selectMasterEventOrException)
        .then(bindEventToController)
        .then(displayPartstatNotification, notify('Error while getting updated event'));
    }

    function onPartstatChangeError() {
      notify('Cannot change your participation to this event');
    }

    function handleErrorOrInvalidMeeting(err) {
      if (err instanceof InvalidMeetingError) {
        self.meeting.invalid = true;
      } else {
        self.meeting.error = err.message || err;
      }

      $log.error(err);
    }

    function handleNonExistentEvent(err) {
      return $q.reject(err.status === 404 ? new InvalidMeetingError('Event not found.') : err);
    }

    function getUserAttendee(event) {
      return calEventUtils.getUserAttendee(event);
    }

    function currentUserIsOrganizer(event) {
      return calEventUtils.isOrganizer(event);
    }

    function isActionable() {
      return self.meeting.method === CAL_EVENT_METHOD.REQUEST && !currentUserIsOrganizer(self.event);
    }

    function getEventByUID() {
      return calEventService.getEventByUID(self.userCalendarHomeId, self.meeting.uid);
    }

    function selectEvent(event) {
      return (self.meeting.method === CAL_EVENT_METHOD.COUNTER ? selectMasterEventOrOccurence : selectMasterEventOrException)(event);
    }

    function selectMasterEventOrOccurence(event) {
      var result = event;

      if (self.meeting.recurrenceId) {
        var date = calMoment(self.meeting.recurrenceId);

        result = event.expand(date.clone().subtract(1, 'day'), date.clone().add(1, 'day'))[0] || event;
      }

      return result;
    }

    function selectMasterEventOrException(event) {
      if (self.meeting.recurrenceId) {
        event = event.getExceptionByRecurrenceId(self.meeting.recurrenceId);

        if (!event) {
          return $q.reject(new InvalidMeetingError('Occurrence ' + self.meeting.recurrenceId + ' not found.'));
        }
      }

      return event;
    }

    function assertEventInvolvesCurrentUser(event) {
      if (currentUserIsOrganizer(event) || getUserAttendee(event)) {
        return event;
      }
      return $q.reject(new InvalidMeetingError('Event does not involve current user.'));
    }

    function assertInvitationSequenceIsNotOutdated(event) {
      if (+self.meeting.sequence < +event.sequence) {
        return $q.reject(new InvalidMeetingError('Sequence is outdated (event.sequence = ' + event.sequence + ').'));
      }

      return event;
    }

    function bindEventToController(event) {
      self.event = event;
    }

    function displayPartstatNotification() {
      calPartstatUpdateNotificationService(getUserAttendee(self.event).partstat);
    }

    function notify(text) {
      return function() {
        notificationFactory.weakInfo('', text);
      };
    }

    function bindReplyAttendeeToController() {
      if (self.meeting.method === CAL_EVENT_METHOD.REPLY || self.meeting.method === CAL_EVENT_METHOD.COUNTER) {
        self.replyAttendee = self.event.getAttendeeByEmail(self.message.from.email);
      }
    }

    function fetchAdditionalData() {
      if (self.meeting.method === CAL_EVENT_METHOD.COUNTER) {
        return bindAttachedICS();
      }
    }

    function bindAttachedICS() {
      var icsFiles = self.message.attachments.filter(function(attachment) {
        return attachment.type === 'application/ics' || attachment.type === 'text/calendar';
      });

      if (!icsFiles || !icsFiles.length) {
        return $q.when();
      }

      return icsFiles[0].getSignedDownloadUrl()
        .then(calEventService.getEventFromICSUrl)
        .then(function(shell) {
          self.additionalEvent = shell;
        });
    }

    function openEvent() {
      var relatedEvents = [];

      if (self.additionalEvent) {
        relatedEvents.push({type: CAL_RELATED_EVENT_TYPES.COUNTER, event: self.additionalEvent, actor: self.replyAttendee});
      }

      calOpenEventForm(self.userCalendarHomeId, self.event, relatedEvents);
    }

    function InvalidMeetingError(message) {
      this.message = message;
      this.meeting = self.meeting;
    }
  }
})(angular);
