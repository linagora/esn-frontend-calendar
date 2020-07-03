(function(angular) {
  'use strict';

  angular.module('esn.calendar').controller('CalPartstatIconController', CalPartstatIconController);

  function CalPartstatIconController(CAL_ICAL) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.PARTSTAT = CAL_ICAL.partstat;
    }
  }
})(angular);
