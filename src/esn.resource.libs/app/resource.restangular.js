'use strict';

angular.module('esn.resource.libs')
  .factory('esnResourceRestangular', esnResourceRestangular);

function esnResourceRestangular(Restangular, httpConfigurer) {
  const RESOURCE_API_PATH = '/linagora.esn.resource/api';

  const esnResourceRestangularInstance = Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl(RESOURCE_API_PATH);
    RestangularConfigurer.setFullResponse(true);
  });

  httpConfigurer.manageRestangular(esnResourceRestangularInstance, RESOURCE_API_PATH);

  return esnResourceRestangularInstance;
}
