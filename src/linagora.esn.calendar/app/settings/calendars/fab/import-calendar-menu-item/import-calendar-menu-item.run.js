const _ = require('lodash');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .run(runBlock);

  function runBlock(dynamicDirectiveService) {
    var dynamicCalImportCalendarMenuItem = new dynamicDirectiveService.DynamicDirective(
      _.constant(true),
      'cal-import-calendar-menu-item',
      { priority: 0 }
    );

    dynamicDirectiveService.addInjection('cal-add-calendar', dynamicCalImportCalendarMenuItem);
  }
})(angular);
