require('../app.constants.js');

angular.module('esn.calendar.libs')
  .factory('calDavRequest', calDavRequest);

function calDavRequest($http, $q, tokenAPI, calCalDAVURLService, CAL_GRACE_DELAY_IS_ACTIVE) {
  let davServerUrlPromise = null;

  return (method, path, headers, body, params) => _configureRequest(method, path, headers, body, params).then($http);

  function _configureRequest(method, path, headers = {}, body, params) {
    if (!CAL_GRACE_DELAY_IS_ACTIVE && params) {
      delete params.graceperiod;
    }

    return $q.all([tokenAPI.getNewToken(), _getDavServerUrl()])
      .then(([{ data }, serverBaseUrl]) => {
        const config = {
          url: `${serverBaseUrl}${path}`,
          headers: { ...headers, ESNToken: data.token },
          method,
          params
        };

        if (body) {
          config.data = body;
        }

        return config;
      });
  }

  function _getDavServerUrl() {
    davServerUrlPromise = davServerUrlPromise || calCalDAVURLService.getFrontendURL();

    return davServerUrlPromise;
  }
}
