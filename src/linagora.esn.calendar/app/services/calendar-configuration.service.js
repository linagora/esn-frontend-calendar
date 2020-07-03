(function(angular) {
    'use strict';

    angular.module('esn.calendar').factory('calendarConfiguration', calendarConfiguration);

    function calendarConfiguration(esnConfig) {

      return {
        get: get
      };

      function get(key, defaultValue) {
        return esnConfig('core.modules.linagora.esn.calendar.' + key, defaultValue);
      }
    }
  })(angular);
