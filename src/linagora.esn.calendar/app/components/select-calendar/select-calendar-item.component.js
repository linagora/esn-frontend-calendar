(function(angular) {
  'use strict';

  angular.module('esn.calendar').component('calSelectCalendarItem', {
    bindings: {
      calendar: '='
    },
    template: require("./select-calendar-item.pug"),
    controller: 'CalSelectCalendarItemController',
    controllerAs: 'ctrl'
  });
})(angular);
