(function(angular) {
  'use strict';

  angular.module('esn.calendar').factory('calFreebusyAPI', calFreebusyAPI);

  function calFreebusyAPI(
    calDavRequest,
    calHttpResponseHandler,
    calGracePeriodResponseHandler,
    CAL_DAV_DATE_FORMAT
  ) {
    return {
      getBulkFreebusyStatus: getBulkFreebusyStatus,
      report: report
    };

    function report(calendarHref, start, end) {
      var body = {
        type: 'free-busy-query',
        match: {
          start: formatDate(start),
          end: formatDate(end)
        }
      };

      return calDavRequest('report', calendarHref, { 'Content-Type': 'application/json' }, body)
        .then(function(response) {
          return response.data && response.data.data || [];
        });
    }

    function getBulkFreebusyStatus(userIds, start, end, excludedEventIds) {
      var body = {
        start: formatDate(start),
        end: formatDate(end),
        users: userIds || [],
        uids: excludedEventIds || []
      };

      return calDavRequest('post', '/calendars/freebusy', { 'Content-Type': 'application/json' }, body)
        .then(function(response) {
          return response.data ? response.data : {};
        });
    }

    function formatDate(date) {
      return date.tz('Zulu').format(CAL_DAV_DATE_FORMAT);
    }
  }
})(angular);
