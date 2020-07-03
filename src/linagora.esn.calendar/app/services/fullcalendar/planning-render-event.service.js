(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calFullCalendarPlanningRenderEventService', calFullCalendarPlanningRenderEventService);

  function calFullCalendarPlanningRenderEventService(
    session,
    calEventUtils,
    calUIAuthorizationService
  ) {
    return function(calendar) {
      return function(event, element) {
        setEventTitle();
        setEventRights();
        switchTableElements();
        setPastEventStyle();

        function setEventTitle() {
          var title = element.find('.fc-list-item-title').find('a');

          title.text(calEventUtils.getEventTitle(event));
        }

        function setEventRights() {
          if (!calUIAuthorizationService.canModifyEvent(calendar, event, session.user._id)) {
            event.startEditable = false;
            event.durationEditable = false;
          }
        }

        function setPastEventStyle() {
          if (event.end.isBefore()) {
            element.addClass('past-event');
          }
        }

        function switchTableElements() {
          // element is a tr with 3 tds: time, dot, description
          // here we put the dot first
          var tr = element[0];
          var tds = tr.children;
          var dot = element[0].removeChild(tds[1]);

          tr.insertBefore(dot, tds[0]);
        }
      };
    };
  }
})(angular);
