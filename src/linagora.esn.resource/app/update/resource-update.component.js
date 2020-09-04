(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .component('esnResourceUpdateModal', {
      bindings: {
        resource: '=',
        type: '=?'
      },
      controller: 'ESNResourceUpdateModalController',
      controllerAs: 'ctrl',
      transclude: true,
      template: require('./resource-update.pug')
    });
})(angular);
