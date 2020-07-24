'use strict';

angular.module('esn.calendar.libs')
  .component('calEventDateEdition', {
    template: require("./event-date-edition.pug"),
    controller: 'calEventDateEditionController',
    controllerAs: 'ctrl',
    bindings: {
      event: '=',
      disabled: '=?',
      dateOnBlur: '=?',
      onDateChange: '=?',
      use24hourFormat: '<'
    }
  });