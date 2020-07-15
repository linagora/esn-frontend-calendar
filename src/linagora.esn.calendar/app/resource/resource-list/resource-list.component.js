(function(angular) {
  'use strict';

  angular.module('esn.calendar')
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
})(angular);
