(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calInboxResourceManagementBlueBar', {
      controller: 'calInboxResourceManagementBlueBarController',
      bindings: {
        message: '<'
      },
      template: require("./resource-management-blue-bar.pug")
    });
})(angular);
