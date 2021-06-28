
angular.module('esn.calendar.libs')
  .controller('CalEventPreviewPopoverController', CalEventPreviewPopoverController);

function CalEventPreviewPopoverController(
  $log,
  $scope,
  $modal,
  session,
  calEventPreviewPopoverService,
  calendarService,
  calAttendeeService,
  calOpenEventForm,
  calEventUtils,
  calEventService,
  calEventDuplicateService,
  calPartstatUpdateNotificationService,
  calUIAuthorizationService,
  urlUtils,
  notificationFactory
) {
  const self = this;

  self.openEventForm = openEventForm;
  self.deleteEvent = deleteEvent;
  self.duplicateEvent = duplicateEvent;
  self.changeParticipation = changeParticipation;
  self.closeEventPreviewPopover = closeEventPreviewPopover;
  self.mailtoURL = _mailtoURL();

  function openEventForm() {
    closeEventPreviewPopover();

    calOpenEventForm(self.event.calendarHomeId, self.event.clone());
  }

  function _mailtoURL() {
    return calEventService.getMailtoURL();
  }

  function deleteEvent() {
    closeEventPreviewPopover();

    if (!self.event.isInstance()) {
      return calEventService.removeEvent(self.event.path, self.event, self.event.etag, false);
    }

    $modal({
      template: require('../event/form/modals/delete-instance-or-series-modal.pug'),
      controller: /* @ngInject */ function($scope) {
        $scope.editChoice = 'this';

        $scope.submit = function() {
          $scope.$hide();

          $scope.editChoice === 'this' ? deleteInstance() : deleteMaster();
        };

        function deleteMaster() {
          calEventService.removeEvent(self.event.path, self.event, self.event.etag, true);
        }

        function deleteInstance() {
          calEventService.removeEvent(self.event.path, self.event, self.event.etag, false);
        }
      },
      placement: 'center'
    });
  }

  function duplicateEvent() {
    calEventDuplicateService.duplicateEvent(self.event).then(duplicatedEvent => {
      calOpenEventForm(session.user._id, duplicatedEvent);
    });
  }

  function changeParticipation(status) {
    const isChangingOrganizerParticipation = self.event.organizer && self.calendarOwnerAsAttendee.email === self.event.organizer.email;

    if (!self.event.isInstance()) {
      if (isChangingOrganizerParticipation) {
        if (status === self.event.getOrganizerPartStat()) return;

        _changeOrganizerParticipation(status);

        return;
      }

      return _changeParticipationAsAttendee(status);
    }

    closeEventPreviewPopover();

    $modal({
      template: require('../event/form/modals/partstat-instance-or-series-modal.pug'),
      controller: /* @ngInject */ function($scope) {
        $scope.editChoice = 'this';

        $scope.submit = function() {
          $scope.$hide();

          $scope.editChoice === 'this' ? updateInstance() : updateMaster();
        };

        function updateMaster() {
          self.event.getModifiedMaster(true).then(masterEvent => {
            isChangingOrganizerParticipation ? _changeOrganizerParticipation(status, masterEvent) : _changeParticipationAsAttendee(status, masterEvent);
          });
        }

        function updateInstance() {
          isChangingOrganizerParticipation ? _changeOrganizerParticipation(status) : _changeParticipationAsAttendee(status);
        }
      },
      placement: 'center'
    });

    function _changeOrganizerParticipation(status, event) {
      const eventPayload = event || self.event;

      calEventService.changeParticipation(eventPayload.path, eventPayload, [eventPayload.organizer.email], status, eventPayload.etag)
        .then(({ etag }) => {
          calPartstatUpdateNotificationService(status);

          self.event.etag = etag;
        })
        .catch(err => {
          $log.error('Organizer event participation update failed', err);

          notificationFactory.weakError('', 'Event participation modification failed');
        });
    }

    function _changeParticipationAsAttendee(status, event) {
      const eventPayload = event || self.event;

      calEventService.changeParticipation(eventPayload.path, eventPayload, [self.calendarOwnerAsAttendee.email], status)
        .then(() => {
          calPartstatUpdateNotificationService(status);
        })
        .catch(err => {
          $log.error('Event participation modification failed', err);

          notificationFactory.weakError('', 'Event participation modification failed');
        });
    }
  }

  function closeEventPreviewPopover() {
    calEventPreviewPopoverService.close();
  }

  $scope.$watch(function() { return self.event; }, _handleEventChanges);
  $scope.$watch(function() { return self.event.attendees; }, _handleAttendeeChanges);

  function _handleEventChanges() {
    if (!self.event) return;

    _setAttendeeEmailAddresses();
    _setIsLocationAWebURL();
    _fetchCalendarAndRights();
  }

  function _handleAttendeeChanges() {
    const { resources, users: attendees } = calAttendeeService.splitAttendeesFromType(self.event.attendees);

    self.attendees = attendees;
    self.resources = resources;

    // Ensure the organizer shows first in the list
    self.attendees.unshift(self.attendees.splice(self.attendees.map(attendee => attendee.email).indexOf(self.event.organizer.email), 1)[0]);

    return Promise.all(self.attendees.map(_populateUserId));

    function _populateUserId(attendee) {
      return calAttendeeService.getUserIdForAttendee(attendee)
        .then(id => {
          attendee.id = id;
        });
    }
  }

  function _setAttendeeEmailAddresses() {
    self.attendeeEmailAddresses = calEventUtils.getEmailAddressesFromAttendeesExcludingCurrentUser(self.event.attendees);
  }

  function _setIsLocationAWebURL() {
    self.isLocationAWebURL = urlUtils.isValidURL(self.event.location);
    self.isLocationAnAbsoluteURL = urlUtils.isAbsoluteURL(self.event.location);
  }

  function _fetchCalendarAndRights() {
    calendarService.listPersonalAndAcceptedDelegationCalendars(self.calendarHomeId)
      .then(calendars => calendars.find(calendar => {
        if (!calendar.source) return calendar.uniqueId === self.event.calendarUniqueId;

        return calendar.source.uniqueId === self.event.calendarUniqueId || calendar.uniqueId === self.event.calendarUniqueId;
      }))
      .then(calendar => {
        self.calendar = calendar;

        return calendar.getOwner();
      })
      .then(owner => {
        self.calendarOwnerAsAttendee = calAttendeeService.getAttendeeForUser(self.event.attendees, owner);

        return calUIAuthorizationService.canModifyEvent(self.calendar, self.event, session.user._id);
      })
      .then(canModifyEvent => {
        self.canModifyEvent = canModifyEvent;
        self.isReadOnly = self.calendar.readOnly;
      });
  }
}
