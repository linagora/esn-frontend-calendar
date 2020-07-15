require('../../components/mini-calendar/mini-calendar.directive.js');
require('../../components/mini-calendar/mini-calendar-mobile.directive.js');
require('../../components/calendar/calendar.component.js');
require('../../components/event-create-button/event-create-button.component.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('calendarView', calendarView);

  function calendarView($rootScope, $timeout) {
    var directive = {
      restrict: 'E',
      template: require("./calendar-view.pug"),
      scope: {
        calendarHomeId: '=',
        uiConfig: '='
      },
      link: link,
      controller: 'calendarViewController'
    };

    return directive;

    ////////////

    function link(scope, element) {
      /*
       * Hiding the header in mobile first template does not work well with FullCalendar
       * because it needs a div :visible to be initialized. This visibility is gotten beacause
       * the header has a certain height. To have a css close solution, in css element.find('.calendar')
       * height is forced to 1px, and element.find('.fc-toolbar') is .hidden-xs. We then should reset
       * the element.find('.calendar') height to auto to have original value.
       */
      $timeout(function() {
        element.find('.calendar').css('height', 'auto');
      }, 0);

      $rootScope.$broadcast('header:disable-scroll-listener', true);
      scope.$on('$destroy', function() {
        $rootScope.$broadcast('header:disable-scroll-listener', false);
      });
    }
  }
})(angular);
