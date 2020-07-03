(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calAttendeeTabs', {
      template: require("./attendee-tabs.pug"),
      bindings: {
        event: '=',
        selectedTab: '='
      }
    });
})(angular);
