'use strict';

require('./event-utils.js');
require('./cal-default-value.service.js');
require('../app.constants');

angular.module('esn.calendar.libs')
  .service('calUIAuthorizationService', calUIAuthorizationService);

function calUIAuthorizationService(
  $q,
  calEventUtils,
  calDefaultValue
) {

  return {
    canAccessEventDetails,
    canDeleteCalendar,
    canExportCalendarIcs,
    canImportCalendarIcs,
    canModifyCalendarProperties,
    canModifyEvent,
    canModifyEventRecurrence,
    canModifyPublicSelection,
    canMoveEvent,
    canShowDelegationTab
  };

  ////////////

  function canAccessEventDetails(calendar, event, userId) {
    // If user is attendee or organizer of an event, event is on own user calendar
    return !!calendar && !!event && (calendar.isOwner(userId) || (event.isPublic() && calendar.isReadable(userId)));
  }

  function canDeleteCalendar(calendar, userId) {
    return !!calendar && (calendar.id !== calDefaultValue.get('calendarId')) && canModifyCalendarProperties(calendar, userId);
  }

  function canExportCalendarIcs(calendar, userId) {
    return !!calendar && calendar.isReadable(userId);
  }

  function canImportCalendarIcs(calendar, userId) {
    return !!calendar && calendar.isOwner(userId) && !calendar.isSubscription();
  }

  function canModifyEvent(calendar, event, userId) {
    if (!!event && calEventUtils.isNew(event)) {
      return $q.when(true);
    }

    return _canModifyEvent(calendar, event, userId);
  }

  function canModifyEventRecurrence(calendar, event, userId) {
    if (!event || event.isInstance()) {
      return $q.when(false);
    }

    return _canModifyEvent(calendar, event, userId);
  }

  function canModifyPublicSelection(calendar, userId) {
    return _isAdminForCalendar(calendar, userId);
  }

  function canModifyCalendarProperties(calendar, userId) {
    // the owner of a Subscription is not the same the current user, so we need to check for calendar.isSubscription()
    // to allow the user to unsubscribe from a public calendar
    return !!calendar && (calendar.isOwner(userId) || calendar.isShared(userId) || calendar.isSubscription());
  }

  function canMoveEvent(calendar, event, user) {
    return calendar.isOwner(user._id) && calEventUtils.isOrganizer(event, user);
  }

  function canShowDelegationTab(calendar, userId) {
    return _isAdminForCalendar(calendar, userId);
  }

  function _isAdminForCalendar(calendar, userId) {
    return !!calendar && calendar.isAdmin(userId) && !calendar.isSubscription();
  }

  function _isOwnerOrganizer(calendar, event) {
    return calendar.getOwner().then(function(owner) {
      return calEventUtils.isOrganizer(event, owner);
    });
  }

  function _canModifyEvent(calendar, event, userId) {
    if (!!calendar && !!event) {
      return _isOwnerOrganizer(calendar, event)
        .then(isEventOrganiser => isEventOrganiser && calendar.isWritable(userId));
    }

    return $q.when(false);
  }
}
