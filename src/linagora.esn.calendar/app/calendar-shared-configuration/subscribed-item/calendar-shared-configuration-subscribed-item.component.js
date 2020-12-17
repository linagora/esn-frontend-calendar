(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendarSharedConfigurationSubscribedItem', {
      bindings: {
        item: '=',
        user: '='
      },
      template: require('./calendar-shared-configuration-subscribed-item.pug')
    });
})();
