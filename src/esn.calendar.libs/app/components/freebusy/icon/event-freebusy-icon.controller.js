require('../freebusy.constants');

'use strict';

angular.module('esn.calendar.libs').controller('CalFreebusyIconController', CalFreebusyIconController);

function CalFreebusyIconController(CAL_FREEBUSY) {
  var self = this;

  self.$onInit = $onInit;

  function $onInit() {
    self.CAL_FREEBUSY = CAL_FREEBUSY;
  }
}
