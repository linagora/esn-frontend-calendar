(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calendarAttendeeService', calendarAttendeeService);

  function calendarAttendeeService(attendeeService, CAL_ICAL, CAL_ATTENDEE_OBJECT_TYPE) {
    var service = {
      getAttendeeCandidates: getAttendeeCandidates
    };
    var attendeeTypeToPartstat = {};
    var attendeeTypeToCUType = {};

    attendeeTypeToPartstat[CAL_ATTENDEE_OBJECT_TYPE.user] = CAL_ICAL.partstat.needsaction;
    attendeeTypeToPartstat[CAL_ATTENDEE_OBJECT_TYPE.resource] = CAL_ICAL.partstat.tentative;
    attendeeTypeToPartstat[CAL_ATTENDEE_OBJECT_TYPE.group] = CAL_ICAL.partstat.tentative;
    attendeeTypeToCUType[CAL_ATTENDEE_OBJECT_TYPE.user] = CAL_ICAL.cutype.individual;
    attendeeTypeToCUType[CAL_ATTENDEE_OBJECT_TYPE.resource] = CAL_ICAL.cutype.resource;
    attendeeTypeToCUType[CAL_ATTENDEE_OBJECT_TYPE.group] = CAL_ICAL.cutype.group;
    attendeeTypeToCUType[CAL_ATTENDEE_OBJECT_TYPE.ldap] = CAL_ICAL.cutype.ldap;

    return service;

    function getAttendeeCandidates(query, limit, types) {
      return attendeeService.getAttendeeCandidates(query, limit, types)
        .then(function(attendeeCandidates) {
          return attendeeCandidates.map(mapPartStat).map(mapCUType);
        });
    }

    function mapPartStat(attendee) {
      // Set resource participation status as accepted for a resource without administrator
      if (attendee.objectType === CAL_ATTENDEE_OBJECT_TYPE.resource && attendee.administrators && attendee.administrators.length === 0) {
        attendee.partstat = CAL_ICAL.partstat.accepted;
      } else {
        attendee.partstat = attendeeTypeToPartstat[attendee.objectType] || CAL_ICAL.partstat.needsaction;
      }

      return attendee;
    }

    function mapCUType(attendee) {
      attendee.cutype = attendeeTypeToCUType[attendee.objectType] || CAL_ICAL.cutype.individual;

      return attendee;
    }
  }

})();
