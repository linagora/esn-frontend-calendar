(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarConfigurationTabMainController', CalendarConfigurationTabMainController);

  function CalendarConfigurationTabMainController(
    $q,
    $state,
    calendarService,
    session,
    userUtils,
    CalCalendarRightsUtilsService,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_SHARED_RIGHT,
    CAL_CALENDAR_TYPE,
    CAL_DAV_PATH,
    calPathBuilder,
    calUIAuthorizationService,
    calCalendarDeleteConfirmationModalService,
    calCalDAVURLService
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.openDeleteConfirmationDialog = openDeleteConfirmationDialog;
    self.removeCalendar = removeCalendar;
    self.unsubscribe = unsubscribe;

    ///////////
    function $onInit() {
      self.publicRights = [
        {
          value: CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE,
          name: CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE_LABEL_LONG
        },
        {
          value: CAL_CALENDAR_PUBLIC_RIGHT.READ,
          name: CAL_CALENDAR_PUBLIC_RIGHT.READ_LABEL_LONG
        },
        {
          value: CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE,
          name: CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE_LABEL_LONG
        }
      ];

      !self.newCalendar && performExternalCalendarOperations(isExternalCalendar());
      self.canModifyPublicSelection = _canModifyPublicSelection();
      self.canExportIcs = canExportIcs();
      self.canDeleteCalendar = canDeleteCalendar();
      self.isResource = self.calendar.type === CAL_CALENDAR_TYPE.RESOURCE;

      if (!self.newCalendar && self.calendar) {
        calCalDAVURLService.getCalendarURL(self.calendar).then(function(url) {
          self.caldavurl = url;
        });
        var calendarToExport = self.calendar.isSubscription() ? self.calendar.source : self.calendar;

        self.calendarIcsUrl = CAL_DAV_PATH + calPathBuilder.forCalendarPath(calendarToExport.calendarHomeId, calendarToExport.id) + '?export';
      }
    }

    function isExternalCalendar() {
      return self.calendar.isShared(session.user._id) || self.calendar.isSubscription();
    }

    function openDeleteConfirmationDialog() {
      calCalendarDeleteConfirmationModalService(self.calendar, removeCalendar);
    }

    function unsubscribe() {
      calendarService.unsubscribe(self.calendarHomeId, self.calendar).then(function() {
        $state.go('calendar.main');
      });
    }

    function removeCalendar() {
      calendarService.removeCalendar(self.calendarHomeId, self.calendar).then(function() {
        $state.go('calendar.main');
      });
    }

    function canDeleteCalendar() {
      return !self.newCalendar && calUIAuthorizationService.canDeleteCalendar(self.calendar, session.user._id);
    }

    function canExportIcs() {
      return !self.newCalendar && calUIAuthorizationService.canExportCalendarIcs(self.calendar, session.user._id);
    }

    function _canModifyPublicSelection() {
      return self.newCalendar || calUIAuthorizationService.canModifyPublicSelection(self.calendar, session.user._id);
    }

    function performExternalCalendarOperations(isExternalCalendar) {
      $q.when(isExternalCalendar)
        .then(function(isExternalCalendar) {
          if (!isExternalCalendar) {
            return $q.reject('Not a shared calendar');
          }
          var shareeRightRaw = self.calendar.rights.getShareeRight(session.user._id);

          self.shareeRight = shareeRightRaw && CalCalendarRightsUtilsService.delegationAsHumanReadable(shareeRightRaw);

          return self.calendar.getOwner();
        })
        .then(function(sharedCalendarOwner) {
          self.sharedCalendarOwner = sharedCalendarOwner;
          self.displayNameOfSharedCalendarOwner = userUtils.displayNameOf(sharedCalendarOwner);
        })
        .catch(angular.noop);
    }
  }
})();
