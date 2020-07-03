(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceAdministratorListItem', {
      bindings: {
        administrator: '=',
        onRemove: '='
      },
      controllerAs: 'ctrl',
      template: require("./resource-administrator-list-item.pug")
    });
})(angular);
