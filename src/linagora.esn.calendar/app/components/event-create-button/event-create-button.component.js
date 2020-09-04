(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calEventCreateButton', {
      template: require('./event-create-button.pug'),
      bindings: {
        calendarHomeId: '<'
      },
      controller: 'calEventCreateButtonController',
      controllerAs: 'ctrl'
    });
})(angular);
