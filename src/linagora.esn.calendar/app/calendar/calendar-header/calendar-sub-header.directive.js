(function() {
  'use strict';

  angular.module('esn.calendar')
         .directive('calendarSubHeader', calendarSubHeader);

  function calendarSubHeader() {
    var directive = {
      restrict: 'E',
      template: require("./calendar-sub-header.pug"),
      replace: true,
      controller: 'calendarSubHeaderController'
    };

    return directive;
  }
})();
