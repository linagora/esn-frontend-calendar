(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalCalendarPlanningController', CalCalendarPlanningController);

  function CalCalendarPlanningController(_, $rootScope, $alert, $q, $window, $timeout, session, esnWithPromiseResult, calOpenEventForm, calCachedEventSource, calendarEventSource, calendarVisibilityService, calendarService, calFullCalendarPlanningRenderEventService, CAL_UI_CONFIG, CAL_MAX_CALENDAR_RESIZE_HEIGHT, CAL_EVENTS, calFullUiConfiguration) {
    var self = this;
    var windowJQuery = angular.element($window);
    var calendarDeffered = $q.defer();
    var calendarPromise = calendarDeffered.promise;
    var eventSourcesMap = {};

    self.viewMode = self.viewMode || 'listDay';
    self.$onDestroy = $onDestroy;
    self.$onInit = $onInit;

    var rootScopeListeners = [
      $rootScope.$on(CAL_EVENTS.CALENDAR_REFRESH, rerenderCalendar),
      $rootScope.$on(CAL_EVENTS.CALENDARS.ADD, addCalendar),
      $rootScope.$on(CAL_EVENTS.CALENDARS.REMOVE, removeCalendar),
      $rootScope.$on(CAL_EVENTS.CALENDARS.UPDATE, updateCalendar),
      $rootScope.$on(CAL_EVENTS.ITEM_ADD, rerenderCalendar),
      $rootScope.$on(CAL_EVENTS.ITEM_MODIFICATION, rerenderCalendar),
      $rootScope.$on(CAL_EVENTS.ITEM_REMOVE, rerenderCalendar)
    ];

    function $onDestroy() {
      rootScopeListeners.forEach(function(unregisterFunction) {
        unregisterFunction();
      });
    }

    function $onInit() {
      self.calendarHomeId = session.user._id;
      self.calendarReady = calendarDeffered.resolve.bind(calendarDeffered);
      self.uiConfig = CAL_UI_CONFIG.planning;
      self.uiConfig.locale = getLocale();
      self.uiConfig.timeFormat = _getTimeFormat();
      self.uiConfig.defaultView = self.viewMode;
      self.uiConfig.eventClick = onEventClick;
      self.uiConfig.eventRender = eventRender;
      self.uiConfig.viewRender = viewRender;

      calendarService.listPersonalAndAcceptedDelegationCalendars(self.calendarHomeId)
        .then(function(calendars) {
          self.calendars = calendars || [];
          self.calendars.forEach(function(calendar) {
            var calId = calendar.getUniqueId();

            eventSourcesMap[calId] = buildEventSourceForCalendar(calendar);
            calendarPromise.then(function(cal) {
              cal.fullCalendar('addEventSource', eventSourcesMap[calId]);
            });
          });
        })
        .catch(displayCalendarError);
      windowJQuery.resize(resizeCalendarHeight);
    }

    function addCalendar(event, calendar) {
      eventSourcesMap[calendar.getUniqueId()] = buildEventSourceForCalendar(calendar);

      calendarPromise.then(function(cal) {
        cal.fullCalendar('addEventSource', eventSourcesMap[calendar.getUniqueId()]);
      });
    }

    function removeCalendar(event, calendarWrapperUniqueId) {
      _.remove(self.calendars, function(calendar) {
        return calendar.getUniqueId() === calendarWrapperUniqueId.uniqueId;
      });

      var removedEventSource = eventSourcesMap[calendarWrapperUniqueId.uniqueId];

      delete eventSourcesMap[calendarWrapperUniqueId.uniqueId];

      calendarPromise.then(function(cal) {
        cal.fullCalendar('removeEventSource', removedEventSource);
      });
    }

    function rerenderCalendar() {
      calendarPromise.then(function(calendar) {
        calendar.fullCalendar('refetchEvents');
      });
    }

    function updateCalendar(event, calendar) {
      self.calendars.forEach(function(cal, index) {
        if (calendar.getUniqueId() === cal.getUniqueId()) {
          self.calendars[index] = calendar;
          forceEventsRedraw(calendar);
        }
      });
    }

    function forceEventsRedraw(calendar) {
      // For now we force redraw when calendar color changes.
      // There is no other way to do this in fullcalendar but 'hopefuly' we have the event cache:
      // Removing then adding the event source costs nothing and does not 'tilt'
      var calId = calendar.getUniqueId();

      if (eventSourcesMap[calId] && calendar.color && calendar.color !== eventSourcesMap[calId].backgroundColor) {
        eventSourcesMap[calId].backgroundColor = calendar.color;
      }

      calendarPromise.then(function(cal) {
        cal.fullCalendar('removeEventSource', eventSourcesMap[calId]);
        cal.fullCalendar('addEventSource', eventSourcesMap[calId]);
      });
    }

    function displayCalendarError(err, errorMessage) {
      $alert({
        content: err && err.message || errorMessage,
        type: 'danger',
        show: true,
        position: 'bottom',
        container: '.calendar-error-message',
        duration: '3',
        animation: 'am-flip-x'
      });
    }

    function buildEventSourceForCalendar(calendar) {
      return {
        events: calCachedEventSource.wrapEventSource(calendar, calendarEventSource(calendar, displayCalendarError)),
        backgroundColor: calendar.color
      };
    }

    function eventRender(event, element, view) {
      var eventCalendar = _.find(self.calendars, function(calendar) {
        return calendar.getUniqueId() === event.calendarUniqueId;
      });

      return calFullCalendarPlanningRenderEventService(eventCalendar)(event, element, view);
    }

    function onEventClick(event) {
      calOpenEventForm(self.calendarHomeId, event.clone());
    }

    function viewRender() {
      // if not, the planning with have a dirty small height...
      resizeCalendarHeight();
    }

    function withCalendar(successCallback, errorCallback) {
      return esnWithPromiseResult(calendarPromise, successCallback, errorCallback);
    }

    function resizeCalendarHeight() {
      $timeout(withCalendar(function(calendar) {
        var height = windowJQuery.height() - calendar.offset().top;

        height = height > CAL_MAX_CALENDAR_RESIZE_HEIGHT ? CAL_MAX_CALENDAR_RESIZE_HEIGHT : height;
        calendar.fullCalendar('option', 'height', height);
      }), 0);
    }

    function getLocale() {
      return calFullUiConfiguration.configureLocaleForCalendar(CAL_UI_CONFIG).calendar.locale;
    }

    function _getTimeFormat() {
      return calFullUiConfiguration.configureTimeFormatForCalendar(CAL_UI_CONFIG).calendar.timeFormat;
    }
  }
})(angular);
