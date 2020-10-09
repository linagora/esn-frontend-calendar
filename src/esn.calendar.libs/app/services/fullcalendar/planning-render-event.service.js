require('../event-utils.js');
require('../cal-ui-authorization-service.js');

'use strict';

angular.module('esn.calendar.libs')
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
      addStyleForEvent(calendar, element, event);

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

      /**
       * @name addStyleForEvent
       * @description Add CSS Styling to events on planning section depends on the participation status of the calendar owner (accept, decline, or tentative)
       * @param  {CalendarCollectionShell}    calendar     The calendar whose the event to style
       * @param  {HTMLElement}              element        The event HTML element that CSS style will be applied on
       * @param  {CalendarShell}              event        The event object whose HTML element that CSS style will be applied on
       */

      function addStyleForEvent(calendar, element, event) {
        calendar.getOwner().then(function(owner) {
          const userAsAttendee = calEventUtils.getUserAttendee(event, owner);

          if (!userAsAttendee) return;

          switch (userAsAttendee.partstat) {
          case 'ACCEPTED':
            element.addClass('planning-event-accepted');
            break;
          case 'TENTATIVE':
            element.addClass('planning-event-tentative');
            element.find('.fc-list-item-time').prepend('<i class="mdi mdi-help-circle "/>');
            break;
          case 'DECLINED':
            element.addClass('planning-event-declined');
            break;
          default:
            element.addClass('planning-event-needs-action');
          }
        });
      }
    };
  };
}
