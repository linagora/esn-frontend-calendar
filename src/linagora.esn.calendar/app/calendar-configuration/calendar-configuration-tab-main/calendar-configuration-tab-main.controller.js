require('../../components/modals/calendar-delete-confirmation/calendar-delete-confirmation-modal.service.js');
const copy = require('copy-to-clipboard');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarConfigurationTabMainController', CalendarConfigurationTabMainController);

  function CalendarConfigurationTabMainController(
    $q,
    $state,
    $scope,
    $timeout,
    calendarService,
    session,
    userUtils,
    CalCalendarRightsUtilsService,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_TYPE,
    calUIAuthorizationService,
    calCalDAVURLService,
    calCalendarSecretAddressConfirmationModalService,
    notificationFactory
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.unsubscribe = unsubscribe;
    self.openResetSecretAddressConfirmationDialog = openResetSecretAddressConfirmationDialog;
    self.getSecretAddress = getSecretAddress;
    self.toggleSecretAddressVisibility = toggleSecretAddressVisibility;
    self.copySecretAddress = copySecretAddress;
    self.exportCalendar = exportCalendar;
    self.isSecretAddressShown = false;

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
      self.isResource = self.calendar.type === CAL_CALENDAR_TYPE.RESOURCE;
      self.canGenerateSecretAddress = canGenerateSecretAddress();

      if (!self.newCalendar && self.calendar) {
        // Used in the template to show the calendar DAV URL.
        calCalDAVURLService.getCalendarURL(self.calendar).then(url => {
          self.caldavurl = url;
        });

        self.calendarToExport = self.calendar.isSubscription() ? self.calendar.source : self.calendar;
      }
    }

    function isExternalCalendar() {
      return self.calendar.isShared(session.user._id) || self.calendar.isSubscription();
    }

    function unsubscribe() {
      calendarService.unsubscribe(self.calendarHomeId, self.calendar).then(function() {
        $state.go('calendar.main');
      });
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

    function openResetSecretAddressConfirmationDialog() {
      calCalendarSecretAddressConfirmationModalService(self.calendar, () => {
        self.getSecretAddress(true)
          .then(() => {
            self.isSecretAddressShown = true;

            notificationFactory.weakInfo('', 'Successfully reset secret address');
          });
      });
    }

    function getSecretAddress(shouldResetLink = false) {
      const payload = {
        calendarHomeId: self.calendarHomeId,
        calendarId: self.calendar.id,
        shouldResetLink
      };

      let notification;

      const showNotificationTimeout = $timeout(() => {
        notification = notificationFactory.strongInfo('', 'Getting secret address...');
      }, 200);

      return calendarService.getSecretAddress(payload)
        .then(secretAddress => {
          self.calendarSecretAddress = secretAddress;
        })
        .finally(() => {
          $timeout.cancel(showNotificationTimeout);

          if (notification) notification.close();
        });
    }

    function toggleSecretAddressVisibility(shouldShow = true) {
      if (shouldShow && !self.calendarSecretAddress) {
        return self.getSecretAddress()
          .then(() => {
            self.isSecretAddressShown = true;
          });
      }

      self.isSecretAddressShown = shouldShow;
    }

    function copySecretAddress() {
      if (self.calendarSecretAddress) {
        notificationFactory.weakInfo('', 'Secret address copied to clipboard');

        return copy(self.calendarSecretAddress);
      }

      self.getSecretAddress()
        .then(() => {
          copy(self.calendarSecretAddress);

          notificationFactory.weakInfo('', 'Secret address copied to clipboard');
        });
    }

    function exportCalendar() {
      calendarService.exportCalendar(self.calendarToExport.calendarHomeId, self.calendarToExport.id);
    }

    function canGenerateSecretAddress() {
      return !self.newCalendar && calUIAuthorizationService.canModifyCalendarProperties(self.calendar, session.user._id);
    }
  }
})(angular);
