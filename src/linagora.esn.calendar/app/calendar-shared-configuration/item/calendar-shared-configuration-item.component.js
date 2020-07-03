(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendarSharedConfigurationItem', {
      bindings: {
        item: '=',
        user: '='
      },
      template: require("./calendar-shared-configuration-item.pug")
    });
})();
