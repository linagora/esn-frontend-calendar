(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calEventInternalUserView', {
      bindings: {
        event: '<',
        attendees: '<'
      },
      controller: 'CalEventViewInternalUserController',
      controllerAs: 'ctrl',
      template: require("../event-view-body.pug")
    });
})();
