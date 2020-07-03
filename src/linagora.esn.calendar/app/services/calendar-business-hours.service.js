(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calBusinessHoursService', calBusinessHoursService);

  function calBusinessHoursService(esnConfig, ESN_CONFIG_DEFAULT) {
    var service = {
      getUserBusinessHours: getUserBusinessHours
    };

    return service;

    function getUserBusinessHours() {
      var DEFAULT_BUSINESS_HOURS = ESN_CONFIG_DEFAULT.core.businessHours;

      return esnConfig('core.businessHours', DEFAULT_BUSINESS_HOURS).then(_getCorrectBusinessHours);
    }

    function _getCorrectBusinessHours(configuration) {
      //rename 'daysOfWeek' property to 'dow' for full-calendar ui config
      var businessHours = angular.copy(configuration);

      return businessHours.map(function(businessHour) {
        businessHour.dow = businessHour.daysOfWeek;
        delete businessHour.daysOfWeek;

        return businessHour;
      });
    }
  }

})();
