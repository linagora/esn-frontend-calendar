(function() {
  'use strict';

  angular.module('esn.calendar')
    .directive('calSidebar', calSidebar);

  function calSidebar(CAL_EVENTS, CAL_LEFT_PANEL_BOTTOM_MARGIN) {
    var directive = {
      restrict: 'E',
      template: require("./sidebar.pug"),
      scope: {
        calendarHomeId: '='
      },
      replace: true,
      link: link
    };

    return directive;

    function link(scope, element) {
      scope.$on(CAL_EVENTS.CALENDAR_HEIGHT, function(event, height) {
        element.height(height - CAL_LEFT_PANEL_BOTTOM_MARGIN);
      });
    }
  }
})();
