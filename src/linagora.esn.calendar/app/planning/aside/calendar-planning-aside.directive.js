(function() {
  'use strict';

  angular.module('esn.calendar')
    .directive('calCalendarPlanningAside', calCalendarPlanningAside);

  function calCalendarPlanningAside($rootScope, $timeout) {
    var directive = {
      restrict: 'E',
      template: require('./calendar-planning-aside.pug'),
      link: link
    };

    return directive;

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
        // force FC to render since the aside was not in the DOM
        // The 'standard' calendarReady hack does not work with the aside
        // https://stackoverflow.com/questions/10340362/jquery-fullcalendar-not-rendering
        element.find('.fc') && element.find('.fc').fullCalendar('render');
      }, 0);
    }
  }
})();
