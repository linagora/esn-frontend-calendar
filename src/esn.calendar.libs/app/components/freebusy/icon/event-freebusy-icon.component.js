'use strict';

angular.module('esn.calendar.libs')
  .component('calFreebusyIcon', {
    template: require('./event-freebusy-icon.pug'),
    controller: 'CalFreebusyIconController',
    controllerAs: 'ctrl',
    bindings: {
      status: '='
    }
  });
