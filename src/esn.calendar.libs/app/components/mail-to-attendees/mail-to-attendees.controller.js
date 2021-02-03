require('../../app.constants.js');

'use strict';

angular.module('esn.calendar.libs')
  .controller('calMailToAttendeesController', calMailToAttendeesController);

function calMailToAttendeesController(calEventUtils) {
  const self = this;

  self.$onInit = function() {
    self.emailAddressesFromAttendees = calEventUtils.getEmailAddressesFromAttendeesExcludingCurrentUser(self.event.attendees);
  };
}
