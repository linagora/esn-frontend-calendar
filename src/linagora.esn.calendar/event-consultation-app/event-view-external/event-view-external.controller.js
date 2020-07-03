(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalEventViewExternalController', CalEventViewExternalController);

  function CalEventViewExternalController(CalendarShell, _) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.event = CalendarShell.from(self.eventJcal);
      self.externalAttendee = _.find(self.event.attendees, { email: self.attendeeEmail});
    }
  }
})();
