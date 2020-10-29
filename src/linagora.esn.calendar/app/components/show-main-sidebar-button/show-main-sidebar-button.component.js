'use strict';

angular.module('esn.calendar')
  .component('calShowMainSidebarButton', {
    controller: 'CalShowMainSidebarButtonController',
    controllerAs: 'ctrl',
    template: require('./show-main-sidebar-button.pug')
  });
