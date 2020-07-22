(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs')
    .factory('calHttpResponseHandler', calHttpResponseHandler);

  function calHttpResponseHandler($q) {
    return function(successStatusCodes, handler) {
      if (!Array.isArray(successStatusCodes)) {
        successStatusCodes = [successStatusCodes];
      }

      return function(response) {
        if (successStatusCodes.indexOf(response.status) === -1) {
          return $q.reject(response);
        }

        return $q.when(response).then(handler);
      };
    };
  }

})(angular);
