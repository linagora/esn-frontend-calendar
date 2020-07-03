(function(angular) {
  'use strict';

  angular.module('esn.calendar').factory('calFreebusyService', calFreebusyService);

  function calFreebusyService(
    $log,
    $q,
    $rootScope,
    _,
    CalVfreebusyShell,
    calFreebusyAPI,
    calPathBuilder,
    calendarAPI,
    calendarService,
    calAttendeeService,
    calMoment,
    CAL_FREEBUSY,
    ICAL
  ) {

    return {
      listFreebusy: listFreebusy,
      isAttendeeAvailable: isAttendeeAvailable,
      areAttendeesAvailable: areAttendeesAvailable,
      getAttendeesAvailability: getAttendeesAvailability,
      setFreeBusyStatus: setFreeBusyStatus,
      setBulkFreeBusyStatus: setBulkFreeBusyStatus
    };

    function setFreeBusyStatus(attendee, start, end) {
      // attendee can have id equals to email when coming from autocomplete
      if (!attendee.id || attendee.id === attendee.email) {
        return calAttendeeService.getUserIdForAttendee(attendee)
          .then(function(id) {
            if (!id) {
              return _setFreebusy(attendee, CAL_FREEBUSY.UNKNOWN);
            }

            attendee.id = id;

            return loadAndPatchAttendee(attendee, start, end);
          });
      }

      return loadAndPatchAttendee(attendee, start, end);

      function loadAndPatchAttendee(attendee, start, end) {
        _setFreebusy(attendee, CAL_FREEBUSY.LOADING);

        return isAttendeeAvailable(attendee.id, start, end)
          .then(function(isAvailable) {
            _setFreebusy(attendee, isAvailable ? CAL_FREEBUSY.FREE : CAL_FREEBUSY.BUSY);
          })
          .catch(function() {
            _setFreebusy(attendee, CAL_FREEBUSY.UNKNOWN);
          });
      }
    }

    function setBulkFreeBusyStatus(attendees, start, end, excludedEvents) {
      if (!attendees || attendees.length === 0) {
        return $q.when();
      }

      return $q.allSettled(attendees.map(populateUserId)).then(setBulkStatus);

      function setBulkStatus() {
        var internalAttendees = attendees.filter(function(attendee) { return !!attendee.id; });
        var externalAttendees = attendees.filter(function(attendee) { return !attendee.id; });
        var internalUserIds = internalAttendees.map(function(attendee) { return attendee.id; });
        var excludedEventIds = (excludedEvents || []).map(function(event) { return event.uid; });

        _setFreeBusyForAttendees(internalAttendees, CAL_FREEBUSY.LOADING);
        _setFreeBusyForAttendees(externalAttendees, CAL_FREEBUSY.UNKNOWN);

        return calFreebusyAPI.getBulkFreebusyStatus(internalUserIds, start, end, excludedEventIds)
          .then(function(result) {
            if (!result.users) {
              return _setFreeBusyForAttendees(internalAttendees, CAL_FREEBUSY.UNKNOWN);
            }

            var userCalendarsHash = _.chain(result.users).indexBy('id').mapValues('calendars').value();

            internalAttendees.forEach(_setInternalUserStatus);

            function _setInternalUserStatus(attendee) {
              if (!userCalendarsHash[attendee.id]) {
                return _setFreebusy(attendee, CAL_FREEBUSY.UNKNOWN);
              }

              _setFreebusy(attendee, _isAvailable(attendee) ? CAL_FREEBUSY.FREE : CAL_FREEBUSY.BUSY);
            }

            function _isAvailable(attendee) {
              return !_.chain(userCalendarsHash[attendee.id])
                .filter(function(v) { return !_.isEmpty(v.busy); })
                .value()
                .length;
            }
          }).catch(function(err) {
            $log.error('Can not get bulk freebusy status', err);
            _setFreeBusyForAttendees(internalAttendees, CAL_FREEBUSY.UNKNOWN);
          });
      }

      function populateUserId(attendee) {
        // attendee can have id equals to email when coming from autocomplete which is bad...
        if (attendee.id && attendee.id !== attendee.email) {
          return $q.when();
        }

        return calAttendeeService.getUserIdForAttendee(attendee)
          .then(function(id) {
            attendee.id = id;
          });
      }
    }

    function listFreebusy(userId, start, end) {
      return calendarService.listFreeBusyCalendars(userId).then(function(cals) {
        var calPromises = cals.map(function(cal) {
          return calFreebusyAPI.report(calPathBuilder.forCalendarId(userId, cal.id), start, end);
        });

        return $q.all(calPromises)
          .then(function(freebusies) {
            return freebusies.map(function(freebusy) {
              var vcalendar = new ICAL.Component(freebusy);
              var vfreebusy = vcalendar.getFirstSubcomponent('vfreebusy');

              return new CalVfreebusyShell(vfreebusy);
            });
          });
      }).catch($q.reject);
    }

    /**
     * @name isAttendeeAvailable
     * @description For a given datetime period, determine if user is Free or Busy, for all is calendars
     * @param {string} attendeeId - Id of the attendee
     * @param {string} dateStart - Starting date of the requested period
     * @param {string} dateEnd - Ending date of the requested period
     * @return {boolean} true on free, false on busy
     */
    function isAttendeeAvailable(attendeeId, dateStart, dateEnd) {
      var start = calMoment(dateStart);
      var end = calMoment(dateEnd);

      return listFreebusy(attendeeId, start, end)
        .then(function(freeBusies) {
          return _.every(freeBusies, function(freeBusy) {
            return freeBusy.isAvailable(start, end);
          });
        })
        .catch($q.reject);
    }

    function areAttendeesAvailable(attendees, start, end, excludedEvents) {
      return getAttendeesAvailability(attendees, start, end, excludedEvents).then(function(result) {
        if (!result.users) {
          throw new Error('Can not retrieve attendees availability');
        }

        return !_
          .chain(result.users)
          .pluck('calendars')
          .flatten()
          .filter(function(v) { return !_.isEmpty(v.busy); })
          .value()
          .length;
      });
    }

    function getAttendeesAvailability(attendees, start, end, excludedEvents) {
      return calAttendeeService.getUsersIdsForAttendees(attendees)
        .then(function(ids) {
          return ids.filter(Boolean);
        })
        .then(function(usersIds) {
          var excludedEventsIds = (excludedEvents || []).map(function(event) {
            return event.uid;
          });

          return calFreebusyAPI.getBulkFreebusyStatus(usersIds, start, end, excludedEventsIds);
        });
    }

    function _setFreebusy(attendee, freebusy) {
      attendee.freeBusy = freebusy;
    }

    function _setFreeBusyForAttendees(attendees, freebusy) {
      attendees.forEach(function(attendee) {
        _setFreebusy(attendee, freebusy);
      });
    }
  }
})(angular);
