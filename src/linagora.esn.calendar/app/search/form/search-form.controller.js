(function(angular) {
  'use strict';

  angular.module('esn.calendar').controller('EventSearchFormController', EventSearchFormController);

  function EventSearchFormController(_, session, calendarService, userAndExternalCalendars, CAL_ADVANCED_SEARCH_CALENDAR_TYPES, CAL_ATTENDEE_OBJECT_TYPE) {
    var self = this;

    self.$onInit = $onInit;
    self.availableAttendeeObjectTypes = [CAL_ATTENDEE_OBJECT_TYPE.user, CAL_ATTENDEE_OBJECT_TYPE.group, CAL_ATTENDEE_OBJECT_TYPE.contact];

    function $onInit() {
      var defaultAdvancedQuery = {
        organizers: [],
        attendees: [],
        contains: self.query.text || '',
        cal: CAL_ADVANCED_SEARCH_CALENDAR_TYPES.ALL_CALENDARS
      };

      self.query.advanced = _.assign(defaultAdvancedQuery, self.query.advanced);

      _fetchCalendars();
    }

    function _fetchCalendars() {
      calendarService.listPersonalAndAcceptedDelegationCalendars(session.user._id).then(function(calendars) {
        var categorizedCalendars = userAndExternalCalendars(calendars);

        self.calendars = {
          myCalendars: categorizedCalendars.userCalendars,
          sharedCalendars: (categorizedCalendars.publicCalendars || []).concat(categorizedCalendars.sharedCalendars || [])
        };

        if (self.calendars.sharedCalendars.length === 0) {
          return;
        }

        calendarService.injectCalendarsWithOwnerName(self.calendars.sharedCalendars).then(function(sharedCalendars) {
          self.calendars = _.assign({}, self.calendars, { sharedCalendars: sharedCalendars });
        });
      });
    }
  }
})(angular);
