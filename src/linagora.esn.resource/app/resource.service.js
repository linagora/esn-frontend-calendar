(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .factory('esnResourceService', esnResourceService);

  function esnResourceService() {
    return {
      getEmail: getEmail
    };

    function getEmail(resource) {
      return resource._id + '@' + resource.domain.name;
    }
  }
})(angular);
