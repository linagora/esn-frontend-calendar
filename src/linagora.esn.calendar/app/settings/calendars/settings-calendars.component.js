'use strict';

angular.module('esn.calendar')
  .component('calSettingsCalendars', {
    controllerAs: 'ctrl',
    controller: 'CalSettingsCalendarsController',
    template: require('./settings-calendars.pug')
  });
