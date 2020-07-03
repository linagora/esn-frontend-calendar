(function(angular) {
  'use strict';

  angular.module('esn.calendar').factory('calPartstatUpdateNotificationService', calPartstatUpdateNotificationService);

  function calPartstatUpdateNotificationService(notificationFactory, CAL_PARTSTAT_READABLE_CONFIRMATION_MESSAGE) {
    return function notify(partstat) {
      partstat &&
      CAL_PARTSTAT_READABLE_CONFIRMATION_MESSAGE[partstat.toUpperCase()] &&
      notificationFactory.weakInfo('Calendar -', CAL_PARTSTAT_READABLE_CONFIRMATION_MESSAGE[partstat.toUpperCase()]);
    };
  }
})(angular);
