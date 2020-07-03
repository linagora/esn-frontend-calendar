(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceAdministratorListItemUser', {
        bindings: {
        administrator: '=',
        onRemove: '<'
        },
        controllerAs: 'ctrl',
        controller: 'ESNResourceAdministratorListItemUserController',
        template: require("./resource-administrator-list-item-user.pug")
    });
})(angular);
