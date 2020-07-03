(function() {
  'use strict';

  angular.module('esn.calendar')
    .directive('applicationMenuCalendar', applicationMenuCalendar);

  function applicationMenuCalendar(applicationMenuTemplateBuilder, CAL_MODULE_METADATA) {
    var directive = {
      restrict: 'E',
      template: applicationMenuTemplateBuilder('/#/calendar', { url: CAL_MODULE_METADATA.icon }, 'Calendar', 'core.modules.linagora.esn.calendar.enabled', CAL_MODULE_METADATA.isDisplayedByDefault),
      replace: true
    };

    return directive;
  }

})();
