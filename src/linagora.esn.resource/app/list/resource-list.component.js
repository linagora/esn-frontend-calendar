(function() {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceList', {
      bindings: {
        type: '='
      },
      controllerAs: 'ctrl',
      controller: 'ESNResourceListController',
      template: require("./resource-list.pug")
    });
})();
