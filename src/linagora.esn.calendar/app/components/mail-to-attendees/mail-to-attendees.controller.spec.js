'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calMailToAttendeesController', function() {
  var $controller, ctrl, attendeesTest, attendeesMailTest, CAL_ICAL;

  beforeEach(function() {
    attendeesTest = [
      { email: 'other1@example.com', partstat: 'NEEDS-ACTION', clicked: false },
      { email: 'other2@example.com', partstat: 'ACCEPTED', clicked: true },
      { email: 'other3@example.com', partstat: 'DECLINED', clicked: false }
    ];

    attendeesMailTest = 'other2@example.com,other3@example.com';

    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.factory('session', function() {
        return {
          user: {
            preferredEmail: 'other1@example.com'
          },
          ready: $q.when({})
        };
      });
    });

    angular.mock.inject(function(_$controller_, _CAL_ICAL_) {
      $controller = _$controller_;
      CAL_ICAL = _CAL_ICAL_;
    });

    ctrl = initController();
  });

  function initController() {
    return $controller('calMailToAttendeesController');
  }

  describe('The getEmailAddressesFromUsers function', function() {

    it('should initialize mail-to-attendees without the current user', function() {
      expect(ctrl.getEmailAddressesFromUsers(attendeesTest)).to.equal(attendeesMailTest);
    });

    it('should initialize mail-to-attendees without duplicates', function() {
      var attendees = angular.copy(attendeesTest);

      attendees.push(attendeesTest[1]);

      expect(ctrl.getEmailAddressesFromUsers(attendees)).to.equal(attendeesMailTest);
    });

    it('should not add resource attendee', function() {
      attendeesTest.push({email: 'aresource@example.com', partstat: 'ACCEPTED', clicked: false, cutype: CAL_ICAL.cutype.resource});

      expect(ctrl.getEmailAddressesFromUsers(attendeesTest)).to.equal(attendeesMailTest);
    });
  });
});
