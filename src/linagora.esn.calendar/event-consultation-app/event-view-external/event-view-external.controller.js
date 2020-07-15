const _ = require('lodash');
require('../../app/services/shells/calendar-shell.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalEventViewExternalController', CalEventViewExternalController);

  function CalEventViewExternalController(CalendarShell) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.event = CalendarShell.from(self.eventJcal);
      self.externalAttendee = _.find(self.event.attendees, { email: self.attendeeEmail});
    }
  }
})(angular);
