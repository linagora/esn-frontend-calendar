(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calFreebusyIcon', {
      template: require("./event-freebusy-icon.pug"),
      controller: 'CalFreebusyIconController',
      controllerAs: 'ctrl',
      bindings: {
        status: '='
      }
    });
})(angular);
