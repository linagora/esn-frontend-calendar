require('../services/http-response-handler.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calGracePeriodResponseHandler', calGracePeriodResponseHandler);

  function calGracePeriodResponseHandler(calHttpResponseHandler) {
    return calHttpResponseHandler(202, function(response) {
      return response.data.id;
    });
  }

})(angular);
