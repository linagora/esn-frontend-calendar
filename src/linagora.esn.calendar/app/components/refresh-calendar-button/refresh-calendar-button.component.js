require('./refresh-calendar-button.controller');

angular.module('esn.calendar')
  .component('calRefreshCalendarButton', {
    controller: 'CalRefreshCalendarButtonController',
    controllerAs: 'ctrl',
    template: require('./refresh-calendar-button.pug')
  });
