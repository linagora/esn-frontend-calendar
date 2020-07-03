(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calCalendarRightComparatorService', calCalendarRightComparatorService);

  function calCalendarRightComparatorService(CAL_CALENDAR_SHARED_RIGHT, CAL_CALENDAR_PUBLIC_RIGHT, CAL_CALENDAR_SHARED_RIGHT_PRIORITY, CAL_CALENDAR_PUBLIC_RIGHT_PRIORITY, CAL_CALENDAR_SHARED_TYPE) {
    var rightsWeights = initPublicRights();

    var service = {
      getMostPermissive: getMostPermissive
    };

    return service;

    ////////////

    function getMostPermissive(userId, calendar1, calendar2) {
      if (_getCalendarRightWeight(userId, calendar1) > _getCalendarRightWeight(userId, calendar2)) {
        return calendar1;
      } else {
        return calendar2;
      }
    }

    function _getCalendarRightWeight(userId, calendar) {
      if (calendar.type === CAL_CALENDAR_SHARED_TYPE.PUBLIC) {
        return rightsWeights[calendar.calendar.rights.getPublicRight()];
      } else {
        return rightsWeights[calendar.calendar.rights.getShareeRight(userId)];
      }
    }

    function initPublicRights() {
      var rightsWeights = {};

      rightsWeights[CAL_CALENDAR_SHARED_RIGHT.SHAREE_OWNER] = CAL_CALENDAR_SHARED_RIGHT_PRIORITY.SHAREE_OWNER;
      rightsWeights[CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN] = CAL_CALENDAR_SHARED_RIGHT_PRIORITY.SHAREE_ADMIN;
      rightsWeights[CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE] = CAL_CALENDAR_SHARED_RIGHT_PRIORITY.SHAREE_READ_WRITE;
      rightsWeights[CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE] = CAL_CALENDAR_PUBLIC_RIGHT_PRIORITY.READ_WRITE;
      rightsWeights[CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ] = CAL_CALENDAR_SHARED_RIGHT_PRIORITY.SHAREE_READ;
      rightsWeights[CAL_CALENDAR_PUBLIC_RIGHT.READ] = CAL_CALENDAR_PUBLIC_RIGHT_PRIORITY.READ;
      rightsWeights[CAL_CALENDAR_SHARED_RIGHT.SHAREE_FREE_BUSY] = CAL_CALENDAR_SHARED_RIGHT_PRIORITY.SHAREE_FREE_BUSY;
      rightsWeights[CAL_CALENDAR_PUBLIC_RIGHT.FREE_BUSY] = CAL_CALENDAR_PUBLIC_RIGHT_PRIORITY.FREE_BUSY;
      rightsWeights[CAL_CALENDAR_SHARED_RIGHT.NONE] = CAL_CALENDAR_SHARED_RIGHT_PRIORITY.NONE;
      rightsWeights[CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE] = CAL_CALENDAR_PUBLIC_RIGHT_PRIORITY.PRIVATE;

      return rightsWeights;
    }
  }
})();
