(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalAttendeeItemConsultController', CalAttendeeItemConsultController);

  function CalAttendeeItemConsultController(CAL_RESOURCE) {
    var self = this;

    self.PARTSTAT_ICONS = CAL_RESOURCE.PARTSTAT_ICONS;
  }
})(angular);
