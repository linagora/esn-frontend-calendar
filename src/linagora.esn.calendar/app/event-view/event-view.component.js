(function() {
  'use strict';

  angular.module('esn.calendar')
    .component('calEventView', {
      bindings: {
        event: '<',
        externalAttendee: '<',
        links: '<'
      },
      controllerAs: 'ctrl',
      controller: 'CalEventViewController',
      template: require('./event-view.pug')
    });
})();
