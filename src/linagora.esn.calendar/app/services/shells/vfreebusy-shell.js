(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('CalVfreebusyShell', CalVfreebusyShellFactory);

  function CalVfreebusyShellFactory(_, calMoment) {
    function CalVfreebusyShell(vfreebusy) {
      this.vfreebusy = vfreebusy;
    }

    CalVfreebusyShell.prototype = {
      isAvailable: isAvailable
    };

    return CalVfreebusyShell;

    ////////////

    /**
     * Return the availability for a given date
     * @param {string|date} dateOfAvailabilityStart - A date as string, object or any kind wrappable by calMoment
     * @param {string|date} dateOfAvailabilityEnd - A date as string, object or any kind wrappable by calMoment
     * @returns {boolean} Return true on available for the given date, false on unavailable
     * @memberOf esn.calendar.CalVfreebusyShellFactory
     */
    function isAvailable(dateOfAvailabilityStart, dateOfAvailabilityEnd) {
      var momentDateOfavailabilityStart = calMoment(dateOfAvailabilityStart);
      var momentDateOfavailabilityEnd = calMoment(dateOfAvailabilityEnd);

      return _.every(this.vfreebusy.getAllProperties('freebusy'), function(freeBusy) {
        var period = freeBusy.getFirstValue();
        var start = calMoment(period.start);
        var end = calMoment(period.end);

        if (start.isSame(momentDateOfavailabilityStart) && end.isSame(momentDateOfavailabilityEnd)) {
          return false;
        }

        var availabilityRequestedNotInBusyTime = !momentDateOfavailabilityStart.isBetween(start, end) &&
          !momentDateOfavailabilityEnd.isBetween(start, end);
        var busyTimeNotInAvailabilityRequested =
            !start.isBetween(momentDateOfavailabilityStart, momentDateOfavailabilityEnd) &&
          !end.isBetween(momentDateOfavailabilityStart, momentDateOfavailabilityEnd);

        return availabilityRequestedNotInBusyTime && busyTimeNotInAvailabilityRequested;
      });
    }
  }
})();
