(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calCalendarPlanning', {
      bindings: {
        // listDay (default), listWeek, listMonth, listYear
        viewMode: '=?'
      },
      controller: 'CalCalendarPlanningController',
      controllerAs: 'ctrl',
      template: require('./calendar-planning.pug')
    });
})(angular);
