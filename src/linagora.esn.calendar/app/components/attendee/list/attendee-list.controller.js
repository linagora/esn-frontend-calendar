(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalAttendeeListController', CalAttendeeListController);

  function CalAttendeeListController(_, calAttendeeService, CAL_ATTENDEE_LIST_LIMIT) {
    var self = this;

    self.removeAttendee = removeAttendee;
    self.$onInit = $onInit;
    self.showAll = showAll;
    self.showToggle = showToggle;

    function $onInit() {
      self.limit = CAL_ATTENDEE_LIST_LIMIT;
      setOrganizerFlag();
      setAttendeesDisplayName();
    }

    function showToggle() {
      return !self.showAllAttendees && self.attendees.length > CAL_ATTENDEE_LIST_LIMIT;
    }

    function showAll() {
      self.showAllAttendees = true;
      self.limit = self.attendees.length;
    }

    function setOrganizerFlag() {
      var organizerAttendee = getOrganizer();

      if (organizerAttendee) {
        organizerAttendee.organizer = true;
      }
    }

    function setAttendeesDisplayName() {
      self.attendees.forEach(function(attendee) {
        attendee.displayName = attendee.displayName || attendee.name;
        calAttendeeService.getUserDisplayNameForAttendee(attendee).then(function(displayName) {
          attendee.displayName = displayName;
        });
      });
    }

    function getOrganizer() {
      return _.find(self.attendees, isOrganizer);
    }

    function isOrganizer(attendee) {
      return attendee && attendee.email && self.organizer && self.organizer.email && self.organizer.email === attendee.email;
    }

    function removeAttendee(attendee) {
      self.onAttendeeRemoved && self.onAttendeeRemoved({attendee: attendee});
    }
  }

})();
