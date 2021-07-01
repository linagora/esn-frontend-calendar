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

    return $q.all([_getDavServerUrl(), tokenAPI.getWebToken()])
      .then(([serverBaseUrl, { data: jwt }]) => {
        const config = {
          url: `${serverBaseUrl}${path}`,
          headers: {
            ...headers,
            Authorization: `Bearer ${jwt}`
          },
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
