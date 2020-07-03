(function(angular) {
  'use strict';

  angular.module('esn.calendar').controller('CalFreebusyIconController', CalFreebusyIconController);

  function CalFreebusyIconController(CAL_FREEBUSY) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.CAL_FREEBUSY = CAL_FREEBUSY;
    }
  }
})(angular);
