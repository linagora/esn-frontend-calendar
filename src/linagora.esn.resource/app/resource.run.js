(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource').run(runBlock);

  function runBlock(attendeeService, esnResourceAttendeeProvider) {
    attendeeService.addProvider(esnResourceAttendeeProvider);
  }
})(angular);
