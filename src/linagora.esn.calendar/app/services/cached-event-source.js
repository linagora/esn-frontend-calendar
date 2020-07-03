(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calCachedEventSource', calCachedEventSource);

  function calCachedEventSource(
    $q,
    _,
    calendarExploredPeriodService,
    calFullUiConfiguration,
    calEventStore,
    calEventUtils,
    calUIAuthorizationService,
    session,
    CAL_CACHED_EVENT_SOURCE_ADD,
    CAL_CACHED_EVENT_SOURCE_DELETE,
    CAL_CACHED_EVENT_SOURCE_UPDATE,
    CAL_ICAL
  ) {
    var changes = {};

    var service = {
      registerAdd: saveChange.bind(null, CAL_CACHED_EVENT_SOURCE_ADD),
      registerDelete: saveChange.bind(null, CAL_CACHED_EVENT_SOURCE_DELETE),
      registerUpdate: saveChange.bind(null, CAL_CACHED_EVENT_SOURCE_UPDATE),
      resetCache: resetCache,
      deleteRegistration: deleteRegistration,
      wrapEventSource: wrapEventSource
    };

    return service;

    ////////////

    function getChanges(calendarUniqueId) {
      changes[calendarUniqueId] = changes[calendarUniqueId] || {};

      return changes[calendarUniqueId];
    }

    function deleteRegistration(event) {
      var calendarChanges = getChanges(event.calendarUniqueId);

      if (calendarChanges[event.id]) {
        (calendarChanges[event.id].instances || []).forEach(function(subEvent) {
          deleteRegistration(subEvent);
        });
        delete calendarChanges[event.id];
      }
    }

    function saveChange(action, event) {
      var calendarChanges = getChanges(event.calendarUniqueId);

      deleteRegistration(event);
      calendarChanges[event.id] = {
        added: new Date(),
        event: event,
        action: action,
        instances: []
      };

      return deleteRegistration.bind(null, event);
    }

    function expandRecurringChange(start, end) {
      angular.forEach(changes, function(calendarChanges) {
        angular.forEach(calendarChanges, function(change) {
          if (change.event.isRecurring() && (!change.expandedUntil || change.expandedUntil.isBefore(end) || !change.expandedFrom || change.expandedFrom.isAfter(start))) {
            change.instances = [];
            change.event.expand(start.clone().subtract(1, 'day'), end.clone().add(1, 'day')).forEach(function(subEvent) {
              if (subEvent.status !== 'CANCELLED') {
                saveChange(change.action, subEvent);
                change.instances.push(subEvent);
              }
            });
            change.expandedUntil = end;
            change.expandedFrom = start;
          }
        });
      });
    }

    function addAddedEvent(start, end, calendarUniqueId, events, customChanges) {
      function eventInPeriod(event) {
        return [event.start, event.end].some(function(date) {
          return date && date.clone().stripTime().isBetween(start, end, 'day', '[]');
        });
      }

      angular.forEach(customChanges || changes[calendarUniqueId], function(change) {
        if (change.action === CAL_CACHED_EVENT_SOURCE_ADD && change.event.calendarUniqueId === calendarUniqueId && !change.event.isRecurring() && eventInPeriod(change.event)) {
          events.push(change.event);
        }
      });

      return events;
    }

    function applyUpdatedAndDeleteEvent(events, start, end, calendarUniqueId) {
      var calendarChanges = getChanges(calendarUniqueId);

      var notAppliedChange = _.chain(calendarChanges).omit(function(change) {
        return change.action !== CAL_CACHED_EVENT_SOURCE_UPDATE;
      }).mapValues(function(change) {
        var result = _.clone(change);

        result.action = CAL_CACHED_EVENT_SOURCE_ADD;

        return result;
      }).value();

      var result = events.reduce(function(previousCleanedEvents, event) {
        var change = calendarChanges[event.id];
        var changeInMaster = event.isInstance() && calendarChanges[event.uid];

        if (!change && !changeInMaster) {
          previousCleanedEvents.push(event);
        } else if (change && change.action === CAL_CACHED_EVENT_SOURCE_UPDATE) {
          delete notAppliedChange[event.id];
          if (change.event.isRecurring()) {
            change.instances.forEach(function(instance) {
              delete notAppliedChange[instance.id];
              previousCleanedEvents.push(instance);
            });
          } else {
            previousCleanedEvents.push(change.event);
          }
        }

        return previousCleanedEvents;
      }, []);

      return addAddedEvent(start, end, calendarUniqueId, result, notAppliedChange);
    }

    function applySavedChange(start, end, calendarUniqueId, events) {
      expandRecurringChange(start, end);

      return addAddedEvent(start, end, calendarUniqueId, applyUpdatedAndDeleteEvent(events, start, end, calendarUniqueId));
    }

    function fetchEventOnlyIfNeeded(start, end, timezone, calendarUniqueId, calendarSource) {
      var defer = $q.defer();
      var period = {start: start, end: end};

      if (calendarExploredPeriodService.getUnexploredPeriodsInPeriod(calendarUniqueId, period).length === 0) {
        defer.resolve(calEventStore.getInPeriod(calendarUniqueId, period));
      } else {
        calendarSource(start, end, timezone, function(events) {
          calendarExploredPeriodService.registerExploredPeriod(calendarUniqueId, period);
          events.map(calEventStore.save.bind(null, calendarUniqueId));
          defer.resolve(events);
        });
      }

      return defer.promise;
    }

    function wrapEventSource(calendar, calendarSource) {
      return function(start, end, timezone, callback) {
        fetchEventOnlyIfNeeded(start, end, timezone, calendar.getUniqueId(), calendarSource)
          .then(filterEndBeforeStartEvents)
          .then(function(events) {
            return setEditable(calendar, events);
          })
          .then(function(events) {
            return callback(_handleDeclinedEvents(applySavedChange(start, end, calendar.getUniqueId(), events)));
          });
      };
    }

    function setEditable(calendar, events) {
      return events.map(function(event) {
        if (!calUIAuthorizationService.canModifyEvent(calendar, event, session.user._id)) {
          event.editable = false;
        }

        return event;
      });
    }

    function filterEndBeforeStartEvents(events) {
      return events.filter(function(event) {
        return event.start.isBefore(event.end);
      });
    }

    function _handleDeclinedEvents(events) {
      if (!calFullUiConfiguration.isDeclinedEventsHidden()) {
        return events;
      }

      return events.filter(function(event) {
        var userAsAttendee = calEventUtils.getUserAttendee(event);

        if (!userAsAttendee) {
          return true;
        }

        return userAsAttendee.partstat !== CAL_ICAL.partstat.declined;
      });
    }

    function resetCache() {
      changes = {};
      calEventStore.reset();
      calendarExploredPeriodService.reset();
    }
  }
})();
