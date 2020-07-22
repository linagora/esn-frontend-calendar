'use strict';

angular.module('esn.calendar.libs').component('calSelectCalendarItem', {
  bindings: {
    calendar: '='
  },
  template: require("./select-calendar-item.pug"),
  controller: 'CalSelectCalendarItemController',
  controllerAs: 'ctrl'
});