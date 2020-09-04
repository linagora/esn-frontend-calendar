'use strict';

angular.module('esn.calendar.libs')
  .component('calResourceItem', {
    bindings: {
      resource: '<',
      canModifyResource: '=',
      remove: '&'
    },
    controller: 'CalResourceItemController',
    controllerAs: 'ctrl',
    template: require('./resource-item.pug')
  });
