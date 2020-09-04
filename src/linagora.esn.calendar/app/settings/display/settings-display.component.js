'use strict';

angular.module('esn.calendar')
  .component('calSettingsDisplay', {
    controllerAs: 'ctrl',
    controller: 'CalSettingsDisplayController',
    template: require('./settings-display.pug')
  });
