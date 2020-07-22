const Restangular = require('restangular');

(function(angular) {
  'use strict';

  angular.module('esn.resource.libs')
    .factory('esnResourceRestangular', esnResourceRestangular);

  function esnResourceRestangular(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/linagora.esn.resource/api');
      RestangularConfigurer.setFullResponse(true);
    });
  }
})(angular);
