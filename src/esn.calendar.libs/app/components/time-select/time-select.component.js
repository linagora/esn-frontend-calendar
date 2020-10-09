'use strict';

angular.module('esn.calendar.libs')
  .component('timeSelect', {
    template: require('./time-select.pug'),
    controller: 'calTimeSelectController',
    controllerAs: 'ctrl',
    bindings: {
      date: '<',
      onTimeChange: '=',
      locale: '@',
      timeFormat: '@',
      disabled: '<?'
    }
  });
