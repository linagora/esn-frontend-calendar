'use strict';

angular.module('esn.calendar.libs')
  .component('calPartstatIcon', {
    template: require('./partstat-icon.pug'),
    controller: 'CalPartstatIconController',
    controllerAs: 'ctrl',
    bindings: {
      partstat: '='
    }
  });
