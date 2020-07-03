(function() {
    'use strict';

    angular.module('esn.calendar')
      .run(runBlock);

    function runBlock(_, dynamicDirectiveService) {
      var dynamicCalImportCalendarMenuItem = new dynamicDirectiveService.DynamicDirective(
        _.constant(true),
        'cal-import-calendar-menu-item',
        { priority: 0 }
      );

      dynamicDirectiveService.addInjection('cal-add-calendar', dynamicCalImportCalendarMenuItem);
    }
  })();
