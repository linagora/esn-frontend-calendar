require('../resource.constants.js');

(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .factory('esnResourceAttendeeProvider', esnResourceAttendeeProvider);

  function esnResourceAttendeeProvider(ESN_RESOURCE_OBJECT_TYPE) {
    return {
      objectType: ESN_RESOURCE_OBJECT_TYPE,
      template: require("./attendee-template.pug")
    };
  }
})(angular);
