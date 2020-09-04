(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('calendarConfigurationHeader', calendarConfigurationHeader);

  function calendarConfigurationHeader() {
    var directive = {
      restrict: 'E',
      template: require('./calendar-configuration-header.pug'),
      replace: true
    };

    return directive;
  }

})(angular);
