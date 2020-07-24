(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs')
    .factory('calDefaultValue', calDefaultValueFactory);
      function calDefaultValueFactory() {
        var defaultVal = {};

        var calDefaultValue = {
          get: get,
          set: set
        };

        function set(key, val) {
          defaultVal[key] = val;
        }

        function get(key) {
          return defaultVal[key];
        }

        return calDefaultValue;
      }
})(angular);
