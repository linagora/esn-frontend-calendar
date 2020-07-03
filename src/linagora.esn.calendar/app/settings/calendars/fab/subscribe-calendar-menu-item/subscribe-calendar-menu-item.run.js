(function() {
  'use strict';

  angular.module('esn.calendar')
    .run(runBlock);

  function runBlock(_, dynamicDirectiveService) {
    var dynamicCalSubscribeCalendarMenuItem = new dynamicDirectiveService.DynamicDirective(
      _.constant(true),
      'cal-subscribe-calendar-menu-item',
      { priority: 1 }
    );

    dynamicDirectiveService.addInjection('cal-add-calendar', dynamicCalSubscribeCalendarMenuItem);
  }
})();
