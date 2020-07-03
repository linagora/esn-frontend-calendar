(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendarImport', {
      controllerAs: 'ctrl',
      controller: 'CalCalendarImportController',
      template: require("./calendar-import.pug")
    });
})(angular);
