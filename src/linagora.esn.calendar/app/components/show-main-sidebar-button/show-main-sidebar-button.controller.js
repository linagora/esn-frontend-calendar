'use strict';

angular.module('esn.calendar')
  .controller('CalShowMainSidebarButtonController', CalShowMainSidebarButtonController);
function CalShowMainSidebarButtonController(calendarSidebarService) {
  const self = this;

  self.toggleDisplay = toggleDisplay;
  function toggleDisplay() {
    const sidebarVisibility = calendarSidebarService.getSidebarVisibility();

    calendarSidebarService.setSidebarVisibility(!sidebarVisibility);
  }
}
