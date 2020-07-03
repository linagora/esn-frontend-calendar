(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceAdministratorList', {
      bindings: {
        administrators: '=',
        onRemove: '='
      },
      controllerAs: 'ctrl',
      template: require("./resource-administrator-list.pug")
    });
})(angular);
