(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calShowPlanningSidebarButton', {
      controller: 'CalShowPlanningSidebarButtonController',
      controllerAs: 'ctrl',
      template: require("./show-planning-sidebar-button.pug")
    });
})(angular);
