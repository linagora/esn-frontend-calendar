(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceListItem', {
      bindings: {
        resource: '<'
      },
      controllerAs: 'ctrl',
      controller: 'esnResourceListItemController',
      template: require("./resource-list-item.pug")
    });
})(angular);
