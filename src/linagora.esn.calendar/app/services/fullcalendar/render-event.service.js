(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .factory('calFullCalendarRenderEventService', calFullCalendarRenderEventService);

  function calFullCalendarRenderEventService(
    $rootScope,
    escapeHtmlUtils,
    matchmedia,
    session,
    esnDatetimeService,
    calEventUtils,
    calUIAuthorizationService,
    ESN_MEDIA_QUERY_SM_XS,
    CAL_MAX_DURATION_OF_SMALL_EVENT,
    CAL_REDRAW_MULTI_DAY_EVENT,
    calMoment
  ) {
    return function(calendar) {
      return function(event, element, view) {
        var timeDiv = element.find('.fc-time');
        var eventTitle = calEventUtils.getEventTitle(event);
        var titleDiv = getFixedTitleDiv(element, eventTitle);
        var titleElement = element.find('.fc-title');

        redrawMultiDayEvent(event, element, titleDiv, eventTitle);
        formatMultiDayEvent(event, titleDiv, eventTitle, view, element, titleElement, calendar);
        addTooltipToEvent(element, eventTitle);
        appendLocation(element, timeDiv, event.location);
        appendDescription(element, event.description);
        adaptTitleWhenShortEvent(event, element, titleDiv, timeDiv, eventTitle);
        switchTitleAndTime(element, view, titleDiv, timeDiv);

        changeEventColorWhenMonthView(event, element, view, timeDiv);

        addIcons(calendar, event, element, view, titleDiv, timeDiv);

        setEventRights(calendar, event);
      };
    };

    function formatMultiDayEvent(event, titleDiv, eventTitle, view, element, titleElement, calendar) {

      titleElement.css('display', 'flex');
      titleElement.css('align-items', 'center');

      if (event.multiDay && view.name !== 'month') {
        if (event.start.week() !== view.start.week()) {
          titleDiv.text(eventTitle);
        }
        titleDiv.text(eventTitle + ' - ' + calMoment(event.start._i).utc(event.start).format('LT'));
      }
      if ((view.name === 'agendaDay' || view.name === 'dayWithDisplayedEvent') && event.start.date() !== view.start.date()) {
        titleDiv.text(eventTitle);
        element.css('margin-left', '10px');
        element.css('border-radius', '0');
        element.addClass('multi-day');

        var beforeElement = document.createElement('div');

        beforeElement.setAttribute('class', 'multi-day-before');
        beforeElement.style.borderRight = '7px solid' + calendar.color;
        element.prepend(beforeElement);

      }
      if ((view.name === 'agendaDay' || view.name === 'dayWithDisplayedEvent') && event.end.date() !== view.end.date()) {
        if (event.start.date() !== view.start.date()) {
          titleDiv.text(eventTitle);
        }
        element.css('margin-right', '10px');
        element.css('border-radius', '0');
        element.addClass('multi-day');

        var afterElement = document.createElement('div');

        afterElement.setAttribute('class', 'multi-day-after');
        afterElement.style.borderLeft = '7px solid' + calendar.color;
        element.append(afterElement);
      }
    }

    function redrawMultiDayEvent(event) {
      if (event.multiDay && !event.multiDayEventRedrawed) {
        var newEvent = event;

        newEvent.end = event.end.clone().add(1, 'day');
        newEvent.multiDayEventRedrawed = true;

        $rootScope.$broadcast(CAL_REDRAW_MULTI_DAY_EVENT, newEvent);
      }
    }

    function adaptTitleWhenShortEvent(event, element, titleDiv, timeDiv, eventTitle) {
      var eventDurationInMinute = event.end.diff(event.start, 'minutes');

      if ((eventDurationInMinute <= CAL_MAX_DURATION_OF_SMALL_EVENT.DESKTOP) && element.find('.fc-time').length && element.find('.fc-title').length) {
        var timeFormat = esnDatetimeService.getTimeFormat();

        timeDiv.remove();
        titleDiv.text(event.start.format(timeFormat) + ' - ' + eventTitle);
      }
    }

    function addIcons(calendar, event, element, view, titleDiv, eventIconDiv) {
      addIconInEventInstance(element, event, titleDiv, eventIconDiv);

      addIconForAttendees(calendar, element, event, titleDiv, eventIconDiv);

      addIconInPrivateEvent(event, titleDiv, eventIconDiv);
    }

    function addIconInPrivateEvent(event, titleDiv, eventIconDiv) {
      if (!event.isPublic()) {
        addMdiIcon(event, titleDiv, eventIconDiv, 'mdi-lock');
      }
    }

    function addIconInEventInstance(element, event, titleDiv, eventIconDiv) {
      if (event.isInstance()) {
        element.addClass('event-is-instance');

        addMdiIcon(event, titleDiv, eventIconDiv, 'mdi-sync');
      }
    }

    function addIconForAttendees(calendar, element, event, titleDiv, eventIconDiv) {
      calendar.getOwner().then(function(owner) {
        var userAsAttendee = calEventUtils.getUserAttendee(event, owner);

        if (userAsAttendee) {
          if (userAsAttendee.partstat === 'NEEDS-ACTION') {
            element.addClass('event-needs-action');
          } else if (userAsAttendee.partstat === 'TENTATIVE') {
            element.addClass('event-tentative');

            addMdiIcon(event, titleDiv, eventIconDiv, 'mdi-help-circle');
          } else if (userAsAttendee.partstat === 'ACCEPTED') {
            element.addClass('event-accepted');
          } else if (userAsAttendee.partstat === 'DECLINED') {
            element.addClass('event-declined');
          } else {
            element.addClass('event-needs-action');
          }
        }
      });
    }

    function addMdiIcon(event, titleDiv, eventIconDiv, mdiIcon) {
      var isMobile = matchmedia.is(ESN_MEDIA_QUERY_SM_XS);
      var isMobileSmallEvent = false;
      var icon = '<i class="mdi ' + mdiIcon + '"/>';

      if (isMobile) {
        var eventDurationInMinute = event.end.diff(event.start, 'minutes');

        isMobileSmallEvent = eventDurationInMinute <= CAL_MAX_DURATION_OF_SMALL_EVENT.MOBILE;

        titleDiv.append(angular.element('<div class="event-icons-mobile"></div>'));
        eventIconDiv = titleDiv.find('.event-icons-mobile');
      }

      if (event.allDay || (isMobile && isMobileSmallEvent)) {
        titleDiv.prepend(icon);
      } else {
        isMobile ? eventIconDiv.append(icon) : eventIconDiv.prepend(icon);
      }
    }

    function addTooltipToEvent(element, toolTip) {
      element.find('.fc-content').attr('title', toolTip);
    }

    function appendDescription(element, description) {
      if (description) {
        element.attr('title', escapeHtmlUtils.escapeHTML(description));
      }
    }

    function appendLocation(element, timeDiv, eventLocation) {
      if (eventLocation) {
        element.addClass('event-with-location');
        timeDiv.append(angular.element('<div class="fc-location">' + escapeHtmlUtils.escapeHTML(eventLocation) + '</div>'));
      }
    }

    function changeEventColorWhenMonthView(event, element, view, timeDiv) {
      if ((view.name === 'month') && !event.allDay && event.isOverOneDayOnly()) {
        var eventColor = element.css('background-color');

        element.css('color', eventColor);
        element.css('border', '0');
        timeDiv.css('background-color', 'transparent');
        element.css('background-color', 'transparent');
      }
    }

    function getFixedTitleDiv(element, eventTitle) {
      var titleDiv = element.find('.fc-title');

      if (!titleDiv.length) {
        // if event does not have title, FC does not add div, so we need to...
        var contentDiv = element.find('.fc-content');

        contentDiv.prepend('<div class="fc-title"></div>');
        titleDiv = element.find('.fc-title');
      }

      titleDiv.text(eventTitle);

      return titleDiv;
    }

    function setEventRights(calendar, event) {
      if (!calUIAuthorizationService.canModifyEvent(calendar, event, session.user._id)) {
        event.startEditable = false;
        event.durationEditable = false;
      }
    }

    function switchTitleAndTime(element, view, titleDiv, timeDiv) {
      if (view.name === 'month') {
        return;
      }

      if (element.find('.fc-time').length) {
        // needs to be checked with find because element is potentially removed for all day events and 30 minutes ones
        timeDiv.before(titleDiv.remove());
      }
    }
  }
})(angular);
