'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calendarsCache service', function() {
  var calendarsCache,
      calendars;

  calendars = [
    {
      calendarHomeId: 'calendar1',
      id: 'calendarId1',
      isOldDefaultCalendar: sinon.stub().returns(false)
    },
    {
      calendarHomeId: 'calendar1',
      id: 'Events',
      isOldDefaultCalendar: sinon.stub().returns(true)
    }
  ];

  beforeEach(function() {
    angular.mock.module('esn.calendar');
  });

  beforeEach(angular.mock.inject(function(_calendarsCache_) {
    calendarsCache = _calendarsCache_;
  }));

  beforeEach(function() {
    calendarsCache.setList(calendars);
  });

  describe('The get function', function() {
    it('should get the calendar', function() {
      var calendar = calendarsCache.get('calendar1', 'calendarId1');

      expect(calendar).to.be.equal(calendars[0]);
    });

    it('should get the calendar even if the calendarId is Events', function() {
      var calendar = calendarsCache.get('calendar1', 'Events');

      expect(calendar).to.be.equal(calendars[1]);
    });

    it('should return null if the calendar is not in cache', function() {
      var calendar = calendarsCache.get('calendar3', 'calendar3');

      expect(calendar).to.be.null;
    });
  });

  describe('The set function', function() {
    it('should add the calendar in cache if it don\'t exist', function() {
      var calendar = {
        calendarHomeId: 'calendar1',
        id: 'calendarId3',
        isOldDefaultCalendar: sinon.stub().returns(false)
      };

      calendarsCache.set(calendar);
      var calendars = calendarsCache.getList('calendar1');

      expect(Object.keys(calendars).length).to.be.equal(3);
      expect(calendarsCache.get('calendar1', 'calendarId3')).to.be.equal(calendar);
    });

    it('should update the calendar in cache if it exist', function() {
      var calendar = {
        calendarHomeId: 'calendar1',
        id: 'calendarId1',
        test: true,
        isOldDefaultCalendar: sinon.stub().returns(false)
      };

      calendarsCache.set(calendar);
      var calendars = calendarsCache.getList('calendar1');

      expect(Object.keys(calendars).length).to.be.equal(2);
      expect(calendarsCache.get('calendar1', 'calendarId1')).to.be.equal(calendar);
    });
  });

  describe('The remove function', function() {
    it('should remove the calendar in cache if it exist', function() {
      calendarsCache.remove('calendar1', 'Events');

      var calendars = calendarsCache.getList('calendar1');

      expect(Object.keys(calendars).length).to.be.equal(1);
      expect(calendarsCache.get('calendar1', 'Events')).to.be.null;
    });

    it('should not remove the calendar in cache if it don\'t exist', function() {
      calendarsCache.remove('calendar1', 'no');

      var calendars = calendarsCache.getList('calendar1');

      expect(Object.keys(calendars).length).to.be.equal(2);
    });
  });

  describe('The getList function', function() {
    it('should get the list of calendars for a calendarHomeId', function() {
      var calendars = calendarsCache.getList('calendar1');

      expect(Object.keys(calendars).length).to.be.equal(2);
    });

    it('should return null if the calendarHomeId is not cached', function() {
      var calendars = calendarsCache.getList('no');

      expect(calendars).to.be.null;
    });
  });

  describe('The setList function', function() {
    it('should set the list of calendars', function() {
      var calendars = [
        {
          calendarHomeId: 'calendar1',
          id: 'calendarId3',
          isOldDefaultCalendar: sinon.stub().returns(false)
        },
        {
          calendarHomeId: 'calendar1',
          id: 'calendarId4',
          isOldDefaultCalendar: sinon.stub().returns(false)
        }
      ];

      calendarsCache.setList(calendars);

      var calendarCached = calendarsCache.getList('calendar1');

      expect(Object.keys(calendarCached).length).to.be.equal(4);
    });
  });
});
