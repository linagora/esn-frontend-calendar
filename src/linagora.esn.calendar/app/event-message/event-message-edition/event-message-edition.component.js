(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calEventMessageEdition', {
      bindings: {
        activitystream: '<',
        calendarHomeId: '<'
      },
      controller: 'CalEventMessageEditionController',
      template: require("./event-message-edition.pug")
   });
})();
