(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalEventViewController', CalEventViewController);

  function CalEventViewController(_, calAttendeeService, notificationFactory) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.attendees = calAttendeeService.splitAttendeesFromType(self.event.attendees);

      calAttendeeService.splitAttendeesFromTypeWithResourceDetails(self.event.attendees).then(function(attendees) {
        self.attendees = _.assign({}, self.attendees, attendees);
      }).catch(function(error) {
        notificationFactory.weakError('Failed to retrieve resources details', error);
      });
    }
  }
})();
