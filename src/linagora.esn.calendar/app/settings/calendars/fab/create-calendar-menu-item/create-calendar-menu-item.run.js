(function() {
  'use strict';

  angular.module('esn.calendar')
    .run(runBlock);

  function runBlock(_, dynamicDirectiveService) {
    var dynamicCalCreateCalendarMenuItem = new dynamicDirectiveService.DynamicDirective(
      _.constant(true),
      'cal-create-calendar-menu-item',
      { priority: 2 }
    );

    dynamicDirectiveService.addInjection('cal-add-calendar', dynamicCalCreateCalendarMenuItem);
  }
})();
