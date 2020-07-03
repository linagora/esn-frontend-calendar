(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calSettingsCalendarsItem', {
      bindings: {
        calendar: '<',
        displayOwner: '<',
        onRemove: '<',
        stateToGo: '<'
      },
      controllerAs: 'ctrl',
      controller: 'CalSettingsCalendarsItemController',
      template: require("./settings-calendars-item.pug")
    });
})();
