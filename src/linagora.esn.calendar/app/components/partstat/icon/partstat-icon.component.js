(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calPartstatIcon', {
      template: require("./partstat-icon.pug"),
      controller: 'CalPartstatIconController',
      controllerAs: 'ctrl',
      bindings: {
        partstat: '='
      }
    });
})(angular);
