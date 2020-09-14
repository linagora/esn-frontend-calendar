'use strict';

const { ESNDavImportClient } = require('esn-dav-import-client');

angular.module('esn.calendar')
  .controller('CalCalendarImportController', CalCalendarImportController);

function CalCalendarImportController(
  $window,
  asyncAction,
  fileUploadService,
  calendarService,
  calendarHomeService,
  calUIAuthorizationService,
  session,
  esnApiClient
) {
  var self = this;

  self.$onInit = $onInit;
  self.canModifyCalendar = canModifyCalendar;
  self.onFileSelect = onFileSelect;
  self.file = null;
  self.isValid = null;
  self.submit = submit;

  $onInit();

  ///////////

  function $onInit() {
    calendarHomeService.getUserCalendarHomeId()
      .then(calendarService.listPersonalAndAcceptedDelegationCalendars)
      .then(function(calendars) {
        self.calendar = calendars[0];
        self.calendars = calendars;
      });
  }

  function onFileSelect(file) {
    if (!file || !(file.length > 0)) {
      return;
    }

    self.file = file[0];
    self.isValid = self.file.type === 'text/calendar';
  }

  function canModifyCalendar(calendar) {
    return calUIAuthorizationService.canImportCalendarIcs(calendar, session.user._id);
  }

  function importFromFile() {
    const esnDavImportClient = new ESNDavImportClient({ esnApiClient, uploadFile: fileUploadService.uploadFile });

    return esnDavImportClient.importFromFile(self.file, self.calendar.href);
  }

  function submit() {
    var notificationMessages = {
      progressing: 'Submitting importing calendar request...',
      success: 'Request submitted',
      failure: 'Failed to submit request'
    };

    var reloadOption = {
      onSuccess: {
        linkText: 'Reload',
        action: function() { $window.location.reload(); }
      }
    };

    asyncAction(
      notificationMessages,
      importFromFile,
      reloadOption
    );
  }
}
