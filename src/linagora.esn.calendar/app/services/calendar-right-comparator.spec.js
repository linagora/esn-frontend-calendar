'use strict';

/* global chai, sinon: */

var expect = chai.expect;

describe('The calCalendarRightComparatorService service', function() {
  var CAL_CALENDAR_SHARED_RIGHT, CAL_CALENDAR_PUBLIC_RIGHT, CAL_CALENDAR_SHARED_TYPE, calCalendarRightComparatorService;
  var publicCalendar, delegatedCalendar, userId;

  beforeEach(function() {
    userId = 'userId';

    angular.mock.module('esn.calendar');

    angular.mock.inject(function(_CAL_CALENDAR_SHARED_RIGHT_, _CAL_CALENDAR_PUBLIC_RIGHT_, _CAL_CALENDAR_SHARED_TYPE_, _calCalendarRightComparatorService_) {
      CAL_CALENDAR_SHARED_RIGHT = _CAL_CALENDAR_SHARED_RIGHT_;
      CAL_CALENDAR_PUBLIC_RIGHT = _CAL_CALENDAR_PUBLIC_RIGHT_;
      CAL_CALENDAR_SHARED_TYPE = _CAL_CALENDAR_SHARED_TYPE_;
      calCalendarRightComparatorService = _calCalendarRightComparatorService_;
    });
  });

  describe('The getMostPermissive function', function() {
    beforeEach(function() {
      publicCalendar = {
        calendar: {
          rights: {}
        },
        type: CAL_CALENDAR_SHARED_TYPE.PUBLIC
      };

      delegatedCalendar = {
        calendar: {
          rights: {}
        },
        type: CAL_CALENDAR_SHARED_TYPE.DELEGATION
      };
    });

    it('should return most permissive calendar', function() {
      delegatedCalendar.calendar.rights.getShareeRight = sinon.stub().returns(CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN);
      publicCalendar.calendar.rights.getPublicRight = sinon.stub().returns(CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE);

      expect(calCalendarRightComparatorService.getMostPermissive(userId, publicCalendar, delegatedCalendar)).to.equal(delegatedCalendar);
      expect(calCalendarRightComparatorService.getMostPermissive(userId, delegatedCalendar, publicCalendar)).to.equal(delegatedCalendar);
    });

  });
});
