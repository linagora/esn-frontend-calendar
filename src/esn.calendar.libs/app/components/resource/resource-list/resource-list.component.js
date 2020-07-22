'use strict';

angular.module('esn.calendar.libs')
  .component('calResourceList', {
    bindings: {
      canModifyResources: '=',
      resources: '=',
      onResourceRemoved: '&'
    },
    controller: 'CalResourceListController',
    controllerAs: 'ctrl',
    template: require("./resource-list.pug")
  });