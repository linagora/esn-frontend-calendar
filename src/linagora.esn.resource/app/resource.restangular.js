(function() {
  'use strict';

  angular.module('linagora.esn.resource')
    .factory('esnResourceRestangular', esnResourceRestangular);

  function esnResourceRestangular(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/linagora.esn.resource/api');
      RestangularConfigurer.setFullResponse(true);
    });
  }
})();
