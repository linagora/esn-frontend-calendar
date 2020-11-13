'use strict';

const _ = require('lodash');

require('../../freebusy/confirmation-modal/event-freebusy-confirmation-modal.service.js');
require('../../../services/calendar-service.js');
require('../../../services/event-service.js');
require('../../../services/attendee.service.js');
require('../../../services/event-utils.js');
require('./open/open-event-form.service.js');
require('../../../services/cal-ui-authorization-service.js');
require('../../../services/attendees-denormalizer.service.js');
require('../../../services/path-builder.js');
require('../../freebusy/freebusy.service.js');
require('../../../services/partstat-update-notification.service.js');
require('../../../app.constants.js');
require('../../freebusy/freebusy.constants.js');
require('../../../services/shells/calendar-shell.js');
require('../../../services/event-duplicate.service.js');

angular.module('esn.calendar.libs')
  .controller('CalEventFormController', CalEventFormController);

function CalEventFormController(
  $timeout,
  $scope,
  $state,
  $log,
  $modal,
  $q,
  calEventFreeBusyConfirmationModalService,
  calendarService,
  userUtils,
  calEventService,
  calAttendeeService,
  calEventUtils,
  CalendarShell,
  notificationFactory,
  calOpenEventForm,
  calUIAuthorizationService,
  calAttendeesDenormalizerService,
  calEventDuplicateService,
  esnDatetimeService,
  session,
  calPathBuilder,
  esnI18nService,
  usSpinnerService,
  calFreebusyService,
  calPartstatUpdateNotificationService,
  VideoConfConfigurationService,
  uuid4,
  CAL_ATTENDEE_OBJECT_TYPE,
  CAL_RELATED_EVENT_TYPES,
  CAL_EVENTS,
  CAL_EVENT_FORM,
  CAL_ICAL,
  CAL_FREEBUSY,
  CAL_EVENT_FORM_SPINNER_TIMEOUT_DURATION,
  CAL_EVENT_DUPLICATE_KEYS
) {
  var initialUserAttendeesRemoved = [];
  var initialResourceAttendeesRemoved = [];
  var spinnerKey = 'event';
  var spinnerTimeoutPromise;

  $scope.selectedTab = 'attendees';
  $scope.restActive = false;
  $scope.CAL_EVENT_FORM = CAL_EVENT_FORM;
  $scope.CAL_ATTENDEE_OBJECT_TYPE = CAL_ATTENDEE_OBJECT_TYPE;
  $scope.initFormData = initFormData;
  $scope.changeParticipation = changeParticipation;
  $scope.modifyEvent = modifyEvent;
  $scope.deleteEvent = deleteEvent;
  $scope.createEvent = createEvent;
  $scope.duplicateEvent = duplicateEvent;
  $scope.isNew = $scope.event.fetchFullEvent ? function() { return false; } : calEventUtils.isNew;
  $scope.isInvolvedInATask = calEventUtils.isInvolvedInATask;
  $scope.updateAlarm = updateAlarm;
  $scope.submit = submit;
  $scope.onUserAttendeesAdded = onUserAttendeesAdded;
  $scope.onResourceAttendeesAdded = onResourceAttendeesAdded;
  $scope.onUserAttendeeRemoved = onUserAttendeeRemoved;
  $scope.onResourceAttendeeRemoved = onResourceAttendeeRemoved;
  $scope.canPerformCall = canPerformCall;
  $scope.goToCalendar = goToCalendar;
  $scope.cancel = cancel;
  $scope.toggleSuggestedEvent = toggleSuggestedEvent;
  $scope.submitSuggestion = submitSuggestion;
  $scope.onDateChange = onDateChange;
  $scope.hideEventForm = true;

  // Initialize the scope of the form. It creates a scope.editedEvent which allows us to
  // rollback to scope.event in case of a Cancel.
  $scope.initFormData();

  function cancel() {
    calEventUtils.resetStoredEvents();
    calEventDuplicateService.reset();
    _hideModal();
  }

  function displayCalMailToAttendeesButton() {
    function organizerIsNotTheOnlyAttendeeInEvent() {
      return _.some($scope.editedEvent.attendees, function(attendee) {
        return attendee.cutype === CAL_ICAL.cutype.individual && $scope.editedEvent.organizer && $scope.editedEvent.organizer.email !== attendee.email;
      });
    }

    var selectedCalendar = _getCalendarByUniqueId($scope.selectedCalendar.uniqueId);

    if (selectedCalendar && selectedCalendar.readOnly) {
      return calEventUtils.hasAttendees($scope.editedEvent) &&
        !calEventUtils.isInvolvedInATask($scope.editedEvent) &&
        !calEventUtils.isNew($scope.editedEvent) &&
        !selectedCalendar.readOnly &&
        organizerIsNotTheOnlyAttendeeInEvent();
    }

    return calEventUtils.hasAttendees($scope.editedEvent) &&
      !calEventUtils.isInvolvedInATask($scope.editedEvent) &&
      !calEventUtils.isNew($scope.editedEvent) &&
      organizerIsNotTheOnlyAttendeeInEvent();
  }

  function _hideModal() {
    if ($scope.$hide) {
      $scope.$hide();
    }
  }

  function _displayNotification(notificationFactoryFunction, title, content, z_index) {
    return notificationFactoryFunction(title, content, z_index);
  }

  function initFormData() {
    spinnerTimeoutPromise = $timeout(function() {
      usSpinnerService.spin(spinnerKey);
    }, CAL_EVENT_FORM_SPINNER_TIMEOUT_DURATION);

    if (!$scope.event.fetchFullEvent) {
      return _initEventForm();
    }

    $scope.event.fetchFullEvent().then(function(fullEvent) {
      $scope.event = fullEvent;

      return _initEventForm();
    });

    function _initEventForm() {
      $scope.use24hourFormat = esnDatetimeService.is24hourFormat();
      $scope.editedEvent = $scope.event.clone();
      $scope.initialAttendees = angular.copy($scope.editedEvent.attendees) || [];
      $scope.newAttendees = calEventUtils.getNewAttendees();
      $scope.newResources = calEventUtils.getNewResources();
      $scope.isOrganizer = calEventUtils.isOrganizer($scope.editedEvent);
      $scope.canSuggestTime = calEventUtils.canSuggestChanges($scope.editedEvent, session.user);
      $scope.inputSuggestions = _.filter($scope.relatedEvents, { type: CAL_RELATED_EVENT_TYPES.COUNTER });

      calendarService.listPersonalAndAcceptedDelegationCalendars($scope.calendarHomeId)
        .then(function(calendars) {
          // Those are the calendars the user can create events within.
          $scope.calendars = calendars;

          if (calEventUtils.isNew($scope.editedEvent)) {
            // This only has a value right after duplicating an event.
            const eventSourceCalendarId = calEventDuplicateService.getDuplicateEventSource();
            const targetCalendar = calendars.find(({ id }) => id === eventSourceCalendarId);

            // Check if the event is duplicated and the user owns the source calendar.
            return eventSourceCalendarId && targetCalendar ? targetCalendar : _.find(calendars, 'selected');
          }

          return _getCalendarByUniqueId($scope.editedEvent.calendarUniqueId);
        })
        .then(function(selectedCalendar) {
          $scope.selectedCalendar = { uniqueId: selectedCalendar.getUniqueId() };

          return selectedCalendar.getOwner();
        })
        .then(function(owner) {
          var selectedCalendar = _getCalendarByUniqueId($scope.selectedCalendar.uniqueId);

          $scope.attendees = calAttendeeService.splitAttendeesFromType($scope.editedEvent.attendees);
          $scope.calendarOwnerAsAttendee = calAttendeeService.getAttendeeForUser($scope.editedEvent.attendees, owner);

          if (!$scope.editedEvent.class) {
            $scope.editedEvent.class = CAL_EVENT_FORM.class.default;
          }

          $scope.displayParticipationButton = displayParticipationButton();
          $scope.displayCalMailToAttendeesButton = displayCalMailToAttendeesButton;
          $scope.canModifyEventAttendees = calUIAuthorizationService.canModifyEventAttendees(selectedCalendar, $scope.editedEvent, session.user._id);
          $scope.$watch('selectedCalendar.uniqueId', setExcludeCurrentUser);

          return $q.all([
            _canModifyEvent(),
            calUIAuthorizationService.canModifyEventRecurrence(selectedCalendar, $scope.editedEvent, session.user._id)
          ]);
        }).then(function(uiAuthorizations) {
          $scope.canModifyEvent = uiAuthorizations[0];
          $scope.canModifyEventRecurrence = uiAuthorizations[1];
          setExcludeCurrentUser();

          return calAttendeeService.splitAttendeesFromTypeWithResourceDetails($scope.editedEvent.attendees);
        }).then(function(attendeesWithResourceDetails) {
          $scope.attendees = _.assign({}, $scope.attendees, attendeesWithResourceDetails);
          calFreebusyService.setBulkFreeBusyStatus(getAttendees(), $scope.event.start, $scope.event.end, [$scope.event]);
          $timeout.cancel(spinnerTimeoutPromise);
          usSpinnerService.stop(spinnerKey);
          $scope.hideEventForm = false;
        });
    }
  }

  function setExcludeCurrentUser() {
    return _canModifyEvent().then(function(canModifyEvent) {
      $scope.excludeCurrentUserFromSuggestedAttendees = _getCalendarByUniqueId($scope.selectedCalendar.uniqueId).isOwner(session.user._id) ? true : !canModifyEvent;
    });
  }

  function setOrganizer() {
    return _getCalendarByUniqueId($scope.selectedCalendar.uniqueId).getOwner()
      .then(function(owner) {
        if (owner) {
          // Calendar can have no owner in case of resource. Need to defined a behaviors for resources

          $scope.editedEvent.organizer = { displayName: userUtils.displayNameOf(owner), emails: owner.emails };
          $scope.editedEvent.attendees.push($scope.editedEvent.organizer);
          $scope.editedEvent.setOrganizerPartStat();
        }

        return owner;
      });
  }

  function denormalizeAttendees() {
    var attendees = angular.copy($scope.editedEvent.attendees);

    return calAttendeesDenormalizerService($scope.editedEvent.attendees)
      .then(function(denormalized) {
        $scope.editedEvent.attendees = calAttendeeService.filterDuplicates(denormalized);
      })
      .catch(function(err) {
        $log.error('Can not denormalize attendees, defaulting to original ones', err);
        $scope.editedEvent.attendees = attendees;
      });
  }

  function _canModifyEvent() {
    return calUIAuthorizationService.canModifyEvent(_getCalendarByUniqueId($scope.selectedCalendar.uniqueId), $scope.editedEvent, session.user._id);
  }

  function displayParticipationButton() {
    return !!$scope.calendarOwnerAsAttendee && !_getCalendarByUniqueId($scope.selectedCalendar.uniqueId).readOnly;
  }

  function canPerformCall() {
    return !(($scope.form && $scope.form.$invalid) || $scope.restActive);
  }

  function cacheAttendees() {
    calEventUtils.setNewAttendees($scope.newAttendees);
    calEventUtils.setNewResources($scope.newResources);
  }

  function createEvent() {
    if (!$scope.editedEvent.title || $scope.editedEvent.title.trim().length === 0) {
      $scope.editedEvent.title = CAL_EVENT_FORM.title.empty;
    }

    if (!$scope.editedEvent.class) {
      $scope.editedEvent.class = CAL_EVENT_FORM.class.default;
    }

    var selectedCalendar = _getCalendarByUniqueId($scope.selectedCalendar.uniqueId);

    if (selectedCalendar) {
      $scope.restActive = true;
      _hideModal();

      $scope.editedEvent.attendees = getAttendees();
      setOrganizer()
        .then(cacheAttendees)
        .then(denormalizeAttendees)
        .then(function() {
          return calEventService.createEvent(selectedCalendar, $scope.editedEvent, {
            graceperiod: true,
            notifyFullcalendar: $state.is('calendar.main')
          });
        })
        .then(onEventCreateUpdateResponse)
        .finally(function() {
          $scope.restActive = false;
        });
    } else {
      _displayNotification(notificationFactory.weakError, 'Event creation failed', 'Cannot join the server, please try later');
    }
  }

  function deleteEvent() {
    $scope.restActive = true;
    _hideModal();

    calEventService.removeEvent($scope.event.path, $scope.event, $scope.event.etag).finally(function() {
      $scope.restActive = false;
    });
  }

  function _changeOrganizerParticipation(status) {
    const eventPayload = $scope.event.clone();

    eventPayload.setOrganizerPartStat(status);
    $scope.restActive = true;

    calEventService.changeParticipation(eventPayload.path, eventPayload, [eventPayload.organizer.email], status, eventPayload.etag)
      .then(({ etag }) => {
        if (!etag) {
          return notificationFactory.weakError('', 'Event participation modification failed');
        }

        calPartstatUpdateNotificationService(status);

        // Set the new Etag to avoid 412 precondition failed
        $scope.event.etag = etag;
        $scope.editedEvent.etag = etag;
      })
      .catch(err => {
        $log.error('Organizer event participation update failed', err);
        notificationFactory.weakError('Event participation modification failed', 'Please refresh your calendar');
      })
      .finally(() => {
        $scope.restActive = false;
      });
  }

  function _changeParticipationAsAttendee(event) {
    var partstat = $scope.calendarOwnerAsAttendee.partstat;

    $scope.restActive = true;
    calEventService.changeParticipation((event && event.path) || $scope.editedEvent.path, event || $scope.event, [$scope.calendarOwnerAsAttendee.email], partstat).then(function(response) {
      if (!response) {
        return;
      }

      if (!$scope.canModifyEvent) {
        calPartstatUpdateNotificationService(partstat);
      }
    }, function() {
      _displayNotification(notificationFactory.weakError, 'Event participation modification failed', 'Please refresh your calendar');
    }).finally(function() {
      $scope.restActive = false;
    });
  }

  function _modifyEvent() {
    if (!$scope.editedEvent.title || $scope.editedEvent.title.trim().length === 0) {
      $scope.editedEvent.title = CAL_EVENT_FORM.title.empty;
    }

    $scope.editedEvent.attendees = getUpdatedAttendees();

    if (!calEventUtils.hasAnyChange($scope.editedEvent, $scope.event)) {
      _hideModal();

      return;
    }

    if ($scope.editedEvent.attendees.length > 0 && !$scope.editedEvent.organizer) {
      setOrganizer();
    }

    $scope.restActive = true;
    _hideModal();

    if ($scope.event.rrule && !$scope.event.rrule.equals($scope.editedEvent.rrule)) {
      $scope.editedEvent.deleteAllException();
    }
    if ($scope.event.alarm && !$scope.editedEvent.alarm) {
      $scope.editedEvent.alarm = $scope.event.alarm;
    }

    return $q.when()
      .then(cacheAttendees)
      .then(denormalizeAttendees)
      .then(function() {
        return calEventService.modifyEvent(
          $scope.event.path || calPathBuilder.forCalendarPath($scope.calendarHomeId, _getCalendarByUniqueId($scope.selectedCalendar.uniqueId).id),
          $scope.editedEvent,
          $scope.event,
          $scope.event.etag,
          angular.noop,
          { graceperiod: true, notifyFullcalendar: $state.is('calendar.main') }
        );
      })
      .then(onEventCreateUpdateResponse)
      .finally(function() {
        $scope.restActive = false;
      });
  }

  function updateAlarm() {
    if ($scope.event.alarm && $scope.event.alarm.trigger) {
      if (!$scope.editedEvent.alarm || $scope.editedEvent.alarm.trigger.toICALString() === $scope.event.alarm.trigger.toICALString()) {
        return;
      }
    }

    $scope.restActive = true;
    var gracePeriodMessage = {
      performedAction: esnI18nService.translate('You are about to modify alarm of %s', { title: $scope.event.title }),
      cancelSuccess: esnI18nService.translate('Modification of %s has been cancelled.', { title: $scope.event.title }),
      gracePeriodFail: esnI18nService.translate('Modification of %s failed. Please refresh your calendar', { title: $scope.event.title }),
      successText: esnI18nService.translate('Alarm of %s has been modified.', { title: $scope.event.title })
    };

    calEventService.modifyEvent(
      $scope.editedEvent.path || calPathBuilder.forCalendarPath($scope.calendarHomeId, _getCalendarByUniqueId($scope.selectedCalendar.uniqueId).id),
      $scope.editedEvent,
      $scope.event,
      $scope.event.etag,
      angular.noop,
      gracePeriodMessage
    ).finally(function() {
      $scope.restActive = false;
    });
  }

  function modifyEvent() {
    if ($scope.canModifyEvent) {
      _modifyEvent();
    } else {
      _changeParticipationAsAttendee();
    }
  }

  function changeParticipation(status) {
    $scope.calendarOwnerAsAttendee.partstat = status;
    if ($scope.editedEvent.organizer && $scope.calendarOwnerAsAttendee.email === $scope.editedEvent.organizer.email) {
      if (status !== $scope.editedEvent.getOrganizerPartStat()) {
        $scope.editedEvent.setOrganizerPartStat(status);
        $scope.$broadcast(CAL_EVENTS.EVENT_ATTENDEES_UPDATE);
        _changeOrganizerParticipation(status);
      }
    } else if ($scope.editedEvent.isInstance()) {
      $modal({
        template: require('./modals/edit-instance-or-series-modal.pug'),
        resolve: {
          attendeeEmail: function() {
            return $scope.calendarOwnerAsAttendee.email;
          },
          event: function() {
            return $scope.editedEvent;
          },
          status: function() {
            return status;
          }
        },
        controller: /* @ngInject */ function($scope, attendeeEmail, event, status) {
          $scope.editChoice = 'this';

          $scope.submit = function() {
            $scope.$hide();

            ($scope.editChoice === 'this' ? updateInstance : updateMaster)();
          };

          function updateMaster() {
            event.getModifiedMaster(true).then(function(eventMaster) {
              $scope.$broadcast(CAL_EVENTS.EVENT_ATTENDEES_UPDATE);

              _changeParticipationAsAttendee(eventMaster);
            });
          }

          function updateInstance() {
            event.changeParticipation(status, [attendeeEmail]);
            $scope.$broadcast(CAL_EVENTS.EVENT_ATTENDEES_UPDATE);

            _changeParticipationAsAttendee();
          }
        },
        placement: 'center'
      });
    } else {
      $scope.editedEvent.changeParticipation(status, [$scope.calendarOwnerAsAttendee.email]);
      $scope.$broadcast(CAL_EVENTS.EVENT_ATTENDEES_UPDATE);

      _changeParticipationAsAttendee();
    }
  }

  function submit() {
    var attendees = getAttendees();

    if (_.some(attendees, { freeBusy: CAL_FREEBUSY.BUSY })) {
      calEventFreeBusyConfirmationModalService(createOrUpdate);
    } else {
      createOrUpdate();
    }

    function createOrUpdate() {
      (calEventUtils.isNew($scope.editedEvent) && !calEventUtils.isInvolvedInATask($scope.editedEvent) ? createEvent : modifyEvent)();
    }
  }

  function goToCalendar(callback) {
    (callback || angular.noop)();
    $state.go('calendar.main');
  }

  function onEventCreateUpdateResponse(success) {
    calEventDuplicateService.reset();

    if (success) {
      calEventUtils.resetStoredEvents();

      return calEventService.onEventCreatedOrUpdated($scope.calendarHomeId, _getCalendarByUniqueId($scope.selectedCalendar.uniqueId).id, $scope.editedEvent.uid)
        .catch(function(err) {
          $log.warn('Failed to apply post create/update operations on event', err);
        });
    }

    $scope.editedEvent.attendees = $scope.initialAttendees;
    calOpenEventForm($scope.calendarHomeId, $scope.editedEvent);
  }

  function onDateChange(updatedDate) {
    updateAttendeesFreeBusyStatus(getAttendees(), updatedDate.start, updatedDate.end);
  }

  function updateAttendeesFreeBusyStatus(attendeesToUpdate, start, end) {
    if (start.isBetween($scope.event.start, $scope.event.end) && end.isBetween($scope.event.start, $scope.event.end)) {
      return;
    }

    calFreebusyService.setBulkFreeBusyStatus(attendeesToUpdate, start, end, [$scope.event]);
  }

  function onUserAttendeesAdded(userAttendeeAdded) {
    calFreebusyService.setFreeBusyStatus(userAttendeeAdded, $scope.editedEvent.start, $scope.editedEvent.end);
  }

  function onResourceAttendeesAdded(resourceAttendeeAdded) {
    calFreebusyService.setFreeBusyStatus(resourceAttendeeAdded, $scope.editedEvent.start, $scope.editedEvent.end);
  }

  function onUserAttendeeRemoved(attendee) {
    if (_.isEmpty(attendee)) {
      return;
    }

    $scope.attendees.users = $scope.attendees.users.filter(function(item) {
      return item.email !== attendee.email;
    });

    initialUserAttendeesRemoved.push(attendee);
  }

  function onResourceAttendeeRemoved(resource) {
    if (_.isEmpty(resource)) {
      return;
    }

    $scope.attendees.resources = $scope.attendees.resources.filter(function(item) {
      return item.email !== resource.email;
    });

    initialResourceAttendeesRemoved.push(resource);
  }

  function getAttendees() {
    return [].concat($scope.attendees.users, $scope.newAttendees, $scope.attendees.resources, $scope.newResources);
  }

  function getUpdatedAttendees() {
    var attendees = $scope.newAttendees.map(function(attendee) {
      return _.find(initialUserAttendeesRemoved, { email: attendee.email }) || attendee;
    });

    var resources = $scope.newResources.map(function(resource) {
      return _.find(initialResourceAttendeesRemoved, { email: resource.email }) || resource;
    });

    return $scope.attendees.users.concat(attendees, $scope.attendees.resources, resources);
  }

  function toggleSuggestedEvent() {
    // cloning the event to avoid to update the current edited event while suggesting date
    $scope.suggestedEvent = $scope.suggestedEvent ? null : $scope.editedEvent.clone();
  }

  function submitSuggestion() {
    return calEventService.sendCounter($scope.suggestedEvent).then(function(response) {
      if (!response) {
        return;
      }

      toggleSuggestedEvent();
      _displayNotification(notificationFactory.weakInfo, 'Calendar -', 'Your proposal has been sent');
    })
      .catch(function() {
        _displayNotification(notificationFactory.weakError, 'Calendar -', 'An error occurred, please try again');
      });
  }

  function _getCalendarByUniqueId(uniqueId) {
    return _.find($scope.calendars, function(calendar) {
      return calendar.getUniqueId() === uniqueId;
    });
  }

  function duplicateEvent() {
    // Build an event copy based on the currently edited event.
    const duplicate = _generateEditedEventCopy();

    // Set the alarm if there was any
    // alarm can't be set with CalendarShell.fromIncompleteShell because the event needs to be created or cloned first.
    if ($scope.editedEvent.alarm) {
      duplicate.alarm = $scope.editedEvent.alarm;
    }

    // Reset the partstat from the original event.
    _resetAttendeesParticipation(duplicate);

    // Check and set a new video conference link if needed.
    if (duplicate && duplicate.xOpenpaasVideoconference) {
      // Wait for the VideoConfConfigurationService to generate a link.
      return _generateVideoConferenceUrl().then(url => {
        duplicate.xOpenpaasVideoconference = url;
        _showDuplicateEventForm(duplicate);
      });
    }

    _showDuplicateEventForm(duplicate);
  }

  function _showDuplicateEventForm(event) {
    if (!event) return;
    // Close the currently opened event form.
    $scope.cancel();
    // Open the duplicate event creation form after a short delay ( let the first modal finish hiding ).
    $timeout(function() {
      calEventDuplicateService.setDuplicateEventSource($scope.event.calendarId);
      calOpenEventForm(session.user._id, event);
    }, CAL_EVENT_FORM_SPINNER_TIMEOUT_DURATION);
  }

  function _generateEditedEventCopy() {
    const details = CAL_EVENT_DUPLICATE_KEYS
      .reduce((details, key) => ($scope.editedEvent[key] ? { [key]: $scope.editedEvent[key], ...details } : details), {});

    return CalendarShell.fromIncompleteShell(details);
  }

  function _generateVideoConferenceUrl() {

    return VideoConfConfigurationService.getOpenPaasVideoconferenceAppUrl()
      .then(openPaasVideoconferenceAppUrl => `${openPaasVideoconferenceAppUrl}${uuid4.generate()}`)
      .catch(err => {
        $log.error('Cannot generate a new video conference URL', err);
        _displayNotification(notificationFactory.weakError, null, 'Failed to create a new video conference room');
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
