(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalShowPlanningSidebarButtonController', CalShowPlanningSidebarButtonController);

  function CalShowPlanningSidebarButtonController($state) {
    var self = this;

    self.toggleDisplay = toggleDisplay;

    function toggleDisplay() {
      if ($state.includes('calendar.main.planning')) {
        $state.go('calendar.main');
      } else {
        $state.go('calendar.main.planning');
      }
    }
  }
})(angular);
