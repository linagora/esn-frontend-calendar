require('../../freebusy/freebusy.constants.js');

'use strict';

angular.module('esn.calendar.libs')
  .controller('CalAttendeeItemController', CalAttendeeItemController);

function CalAttendeeItemController($scope, CAL_FREEBUSY, calEventService) {
  var self = this;

  self.removeAttendee = removeAttendee;
  self.$onInit = $onInit;
  self.CAL_FREEBUSY = CAL_FREEBUSY;
  self.mailtoURL = _mailtoURL();

  function removeAttendee() {
    self.remove && self.remove({ attendee: self.attendee });
  }

  function $onInit() {
    var unwatch = $scope.$watch('ctrl.attendee.id', function(newValue) {
      if (newValue) {
        self.attendee._id = newValue;
        self.attendee.preferredEmail = self.attendee.preferredEmail || self.attendee.email;
        unwatch();
      }
    });
  }

  function _mailtoURL() {
    return calEventService.getMailtoURL();
  }

}
