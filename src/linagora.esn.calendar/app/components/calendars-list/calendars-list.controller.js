(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarsListController', CalendarsListController);

  function CalendarsListController(
    $rootScope,
    $scope,
    $q,
    calendarService,
    calendarVisibilityService,
    session,
    userAndExternalCalendars,
    _,
    CAL_EVENTS
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.activate = activate;

    ////////////

    function $onInit() {
      self.calendars = [];
      self.userCalendars = [];
      self.publicCalendars = [];
      self.sharedCalendars = [];
      self.hiddenCalendars = {};
      self.toggleCalendar = calendarVisibilityService.toggle;

      self.activate();
    }

    function activate() {
      $q
        .all(listCalendars(), getHiddenCalendars())
        .then(function() {
          var destroyCalAddEvent = $rootScope.$on(CAL_EVENTS.CALENDARS.ADD, onCalendarAdded);
          var destroyCalRemoveEvent = $rootScope.$on(CAL_EVENTS.CALENDARS.REMOVE, onCalendarRemoved);
          var destroyCalUpdateEvent = $rootScope.$on(CAL_EVENTS.CALENDARS.UPDATE, onCalendarUpdated);
          var deregister = $rootScope.$on(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, function(event, data) {
            self.hiddenCalendars[data.calendarUniqueId] = data.hidden;
          });

          $scope.$on('$destroy', destroyCalAddEvent);
          $scope.$on('$destroy', destroyCalRemoveEvent);
          $scope.$on('$destroy', destroyCalUpdateEvent);
          $scope.$on('$destroy', deregister);
        });
    }

    function listCalendars() {
      return calendarService.listPersonalAndAcceptedDelegationCalendars(session.user._id).then(function(calendars) {
        self.calendars = _.clone(calendars);

        refreshCalendarsList();
      });
    }

    function getHiddenCalendars() {
      return calendarVisibilityService.getHiddenCalendars().then(function(hiddenCalendars) {
        hiddenCalendars.forEach(function(calendarUniqueId) {
          self.hiddenCalendars[calendarUniqueId] = true;
        });
      });
    }

    function onCalendarAdded(event, calendar) {
      if (!_.find(self.calendars, { uniqueId: calendar.uniqueId })) {
        self.calendars.push(calendar);

        refreshCalendarsList();
      }
    }

    function onCalendarUpdated(event, calendar) {
      var index = _.findIndex(self.calendars, { uniqueId: calendar.uniqueId });

      if (index > -1) {
        self.calendars[index] = calendar;

        refreshCalendarsList();
      }
    }

    function onCalendarRemoved(event, calendarUniqueIdWrapper) {
      _.remove(self.calendars, function(calendar) {
        return calendar.getUniqueId() === calendarUniqueIdWrapper.uniqueId;
      });

      refreshCalendarsList();
    }

    function refreshCalendarsList() {
      var calendars = userAndExternalCalendars(self.calendars);

      self.userCalendars = calendars.userCalendars;
      self.sharedCalendars = calendars.sharedCalendars;
      self.publicCalendars = calendars.publicCalendars;
    }
  }
})();
