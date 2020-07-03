(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalSharedRightsDisplayController', CalSharedRightsDisplayController);

  function CalSharedRightsDisplayController(CalCalendarRightsUtilsService) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      if (self.delegation) {
        self.humanReadable = CalCalendarRightsUtilsService.delegationAsHumanReadable(self.delegation);
      } else if (self.public) {
        self.humanReadable = CalCalendarRightsUtilsService.publicAsHumanReadable(self.public);
      }
    }
  }
})();
