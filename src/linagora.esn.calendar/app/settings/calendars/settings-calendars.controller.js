(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalSettingsCalendarsController', CalSettingsCalendarsController);

  function CalSettingsCalendarsController(
    $log,
    $rootScope,
    $scope,
    $q,
    _,
    session,
    calendarService,
    calCalendarDeleteConfirmationModalService,
    userAndExternalCalendars,
    CAL_EVENTS
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.remove = remove;

    function $onInit() {
      listCalendars()
      .then(function() {
        $scope.$on(CAL_EVENTS.CALENDARS.ADD, onCalendarAdded);
        $scope.$on(CAL_EVENTS.CALENDARS.REMOVE, onCalendarRemoved);
        $scope.$on(CAL_EVENTS.CALENDARS.UPDATE, onCalendarUpdated);
      });
    }

    function onCalendarAdded(event, calendar) {
      if (!_.find(self.calendars, { uniqueId: calendar.uniqueId })) {
        self.calendars.push(calendar);
        refreshCalendarsList();
      }
    }

    function onCalendarRemoved(event, calendarUniqueIdWrapper) {
      _.remove(self.calendars, function(calendar) {
        return calendar.getUniqueId() === calendarUniqueIdWrapper.uniqueId;
      });

      refreshCalendarsList();
    }

    function onCalendarUpdated(event, calendar) {
      var index = _.findIndex(self.calendars, { uniqueId: calendar.uniqueId });

      if (index > -1) {
        self.calendars[index] = calendar;

        refreshCalendarsList();
      }
    }

    function listCalendars() {
      return calendarService.listPersonalAndAcceptedDelegationCalendars(session.user._id).then(function(calendars) {
        self.calendars = calendars;

        refreshCalendarsList();
      });
    }

    function remove(calendar) {
      _openDeleteConfirmationDialog(calendar);
    }

    function _openDeleteConfirmationDialog(calendar) {
      function removeCalendar() {
        calendarService.removeCalendar(calendar.calendarHomeId, calendar).then(function() {
          handleCalendarRemove(calendar);
        }, function(err) {
          $log.error('Can not delete calendar', calendar, err);
        });
      }

      self.modal = calCalendarDeleteConfirmationModalService(calendar, removeCalendar);
    }

    function handleCalendarRemove(calendar) {
      _.remove(self.calendars, { uniqueId: calendar.uniqueId });
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
