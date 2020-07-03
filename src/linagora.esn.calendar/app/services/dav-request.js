(function() {
  'use strict';

  angular.module('esn.calendar')
    .factory('calDavRequest', calDavRequest);

  function calDavRequest($http, $q, httpConfigurer, CAL_DAV_PATH, CAL_GRACE_DELAY_IS_ACTIVE) {
    return request;

    ////////////

    function request(method, path, headers, body, params) {
      return _configureRequest(method, path, headers, body, params).then($http);
    }

    function _ensurePathToProxy(path) {
      return path.substring(path.indexOf('/calendars'), path.length);
    }

    function _configureRequest(method, path, headers, body, params) {
      var url = CAL_DAV_PATH;

      if (!CAL_GRACE_DELAY_IS_ACTIVE) {
        params && delete params.graceperiod;
      }

      headers = headers || {};

      var config = {
        url: httpConfigurer.getUrl(url + _ensurePathToProxy(path)),
        method: method,
        headers: headers,
        params: params
      };

      if (body) {
        config.data = body;
      }

      return $q.when(config);
    }
  }

})();
