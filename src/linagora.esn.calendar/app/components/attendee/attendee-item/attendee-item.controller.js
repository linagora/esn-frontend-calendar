(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalAttendeeItemController', CalAttendeeItemController);

  function CalAttendeeItemController($scope, CAL_FREEBUSY) {
    var self = this;

    self.removeAttendee = removeAttendee;
    self.$onInit = $onInit;
    self.CAL_FREEBUSY = CAL_FREEBUSY;

    function removeAttendee() {
      self.remove && self.remove({attendee: self.attendee});
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
  }
})();
