(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarIcon', {
      template: require('./calendar-icon.pug'),
      bindings: {
        isResource: '=?',
        calendarIcon: '=?',
        calendarColor: '=?',
        selected: '=?',
        isHover: '=?'
      }
    });
})(angular);
