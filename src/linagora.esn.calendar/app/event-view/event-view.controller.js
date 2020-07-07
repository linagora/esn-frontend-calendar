const _ = require('lodash');
require('../services/attendee.service.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalEventViewController', CalEventViewController);

  function CalEventViewController(calAttendeeService, notificationFactory) {
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
})(angular);
