(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .component('calendarConfigForm', {
      template: require("./calendar-config-form.pug"),
      bindings: {
        configurations: '='
      }
    });

})(angular);
