(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('calInboxResourceManagementBlueBarController', calInboxResourceManagementBlueBarController);

  function calInboxResourceManagementBlueBarController(
    _,
    $q,
    $log,
    calEventService,
    calPathParser,
    calResourceService,
    esnResourceAPIClient,
    esnResourceService,
    notificationFactory,
    CAL_ICAL,
    INVITATION_MESSAGE_HEADERS,
    X_OPENPAAS_CAL_HEADERS
  ) {
    var defaultParticipationButtonClass = 'btn-default';
    var self = this;

    self.$onInit = $onInit;
    self.acceptResourceReservation = acceptResourceReservation;
    self.declineResourceReservation = declineResourceReservation;
    self.getParticipationButtonClass = getParticipationButtonClass;

    function $onInit() {
      self.meeting = {
        method: self.message.headers[INVITATION_MESSAGE_HEADERS.METHOD],
        eventPath: getEventPath()
      };

      if (self.meeting.eventPath) {
        self.meeting.parsedEventPath = calPathParser.parseEventPath(self.meeting.eventPath);
      }

      getEvent()
        .then(bindEventToController, handleUnknownEvent)
        .then(loadResource)
        .then(bindResourceToController)
        .then(setPartstatFromEvent)
        .catch(handleError)
        .finally(function() {
          self.meeting.loaded = true;
        });
    }

    function getEventPath() {
      var eventHeader = _.findKey(self.message.headers, function(value, key) {
        return key.toLowerCase() === X_OPENPAAS_CAL_HEADERS.EVENT_PATH.toLowerCase();
      });

      return self.message.headers[eventHeader];
    }

    function acceptResourceReservation() {
      if (self.partstat === CAL_ICAL.partstat.accepted) {
        return;
      }

      return calResourceService.acceptResourceReservation(self.resource._id, self.meeting.parsedEventPath.eventId)
        .then(function() {
          self.partstat = CAL_ICAL.partstat.accepted;
          notify('Resource reservation confirmed!')();
        })
        .catch(notify('Cannot change the resource reservation'));
    }

    function declineResourceReservation() {
      if (self.partstat === CAL_ICAL.partstat.declined) {
        return;
      }

      return calResourceService.declineResourceReservation(self.resource._id, self.meeting.parsedEventPath.eventId)
        .then(function() {
          self.partstat = CAL_ICAL.partstat.declined;
          notify('Resource reservation declined!')();
        })
        .catch(notify('Cannot change the resource reservation'));
    }

    function handleUnknownEvent(err) {
      return $q.reject(err.status === 404 ? new InvalidEventError('Event not found.') : err);
    }

    function handleError(err) {
      if (err instanceof InvalidEventError) {
        self.meeting.invalid = true;
      } else {
        self.meeting.error = err.message || err;
      }

      $log.error(err);
    }

    function getEvent() {
      return calEventService.getEvent(self.meeting.eventPath);
    }

    function getParticipationButtonClass(cls, partstat) {
      return self.partstat === partstat ? cls : defaultParticipationButtonClass;
    }

    function getResourceParticipation() {
      return _.find(self.event.attendees, function(attendee) {
        return attendee.email === esnResourceService.getEmail(self.resource);
      }) || {};
    }

    function setPartstatFromEvent() {
      self.partstat = getResourceParticipation().partstat || CAL_ICAL.partstat.needsaction;
    }

    function bindEventToController(event) {
      self.event = event;
    }

    function loadResource() {
      return esnResourceAPIClient.get(self.event.calendarHomeId).then(function(response) {
        return response.data;
      });
    }

    function bindResourceToController(resource) {
      self.resource = resource;
    }

    function notify(text) {
      return function() {
        notificationFactory.weakInfo('', text);
      };
    }

    function InvalidEventError(message) {
      this.message = message;
      this.meeting = self.meeting;
    }
  }
})(angular);
