const _ = require('lodash');

require('../app.constants');

(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs')
    .factory('CalCalendarRightsUtilsService', CalCalendarRightsUtilsService);

  function CalCalendarRightsUtilsService(CAL_CALENDAR_PUBLIC_RIGHT, CAL_CALENDAR_SHARED_RIGHT) {
    return {
      publicAsHumanReadable: _rightAsHumanReadable.bind(null, CAL_CALENDAR_PUBLIC_RIGHT),
      delegationAsHumanReadable: _rightAsHumanReadable.bind(null, CAL_CALENDAR_SHARED_RIGHT)
    };

    function _rightAsHumanReadable(calendarRightCollection, currentRight) {
      if (!angular.isString(currentRight)) {
        return calendarRightCollection.unknown;
      }

      var key = _.findKey(calendarRightCollection, _.partial(_.isEqual, currentRight));

      return key ? calendarRightCollection[key + '_LABEL'] : calendarRightCollection.unknown;
    }
  }
})(angular);
