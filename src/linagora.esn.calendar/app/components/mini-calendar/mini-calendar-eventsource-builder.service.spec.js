'use strict';

/* global chai, sinon, moment: false */

var expect = chai.expect;

describe('The calMiniCalendarEventSourceBuilderService service', function() {
  var calMoment, calendar, start, end, timezone, eventSources, calMiniCalendarEventSourceBuilderService, $rootScope, calendarEventSourceBuilder;

  beforeEach(function() {
    angular.mock.module('esn.calendar', 'linagora.esn.graceperiod');
    moment.tz.setDefault('Europe/Paris');
  });

  beforeEach(function() {
    eventSources = [];
    timezone = 'tm';
    calendar = {
      fullCalendar: sinon.spy()
    };
    calendarEventSourceBuilder = sinon.stub().returns(eventSources);
  });

  beforeEach(function() {
    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('calendarEventSourceBuilder', calendarEventSourceBuilder);
    });
  });

  beforeEach(angular.mock.inject(function(_calMoment_, _calMiniCalendarEventSourceBuilderService_, _$rootScope_) {
    calMoment = _calMoment_;
    calMiniCalendarEventSourceBuilderService = _calMiniCalendarEventSourceBuilderService_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    start = calMoment('2015-01-01');
    end = calMoment('2015-01-30');
  });

  afterEach(function() {
    moment.tz.setDefault(null);
  });

  describe('The events function', function() {
    function getService() {
      return calMiniCalendarEventSourceBuilderService(calendar, eventSources);
    }

    it('should aggregate events from event sources in a event per day with the number of real event as title', function(done) {
      var sourceEvents = [{
        id: 'a',
        start: calMoment('2015-01-01T14:31:25.724Z'),
        end: calMoment('2015-01-01T15:31:25.724Z')
      }, {
        id: 'b',
        start: calMoment('2015-01-01T17:31:25.724Z'),
        end: calMoment('2015-01-01T18:31:25.724Z')
      }, {
        id: 'c',
        start: calMoment('2015-01-01T14:31:25.724Z'),
        end: calMoment('2015-01-02T15:31:25.724Z')
      }];

      var eventSource = sinon.spy(function eventSource(_start, _end, _timezone, callback) {
        expect(_start).to.equals(start);
        expect(_end).to.equals(end);
        expect(_timezone).to.equals(timezone);
        callback(sourceEvents);
      });

      eventSources.push(eventSource);

      getService().events(start, end, timezone, function(events) {
        var numFakeEvent = 0;
        var fakeEvent = {};

        events.forEach(function(event) {
          expect(event.allDay).to.be.true;
          fakeEvent[event.start] = parseInt(event.title, 10);
          numFakeEvent++;
        });

        expect(fakeEvent['2015-01-01']).to.equals(3);
        expect(fakeEvent['2015-01-02']).to.equals(1);
        expect(numFakeEvent).to.equals(2);
        expect(calendar.fullCalendar).to.have.been.calledWith('removeEvents');
        done();
      });

      $rootScope.$digest();
    });

    it('should not count event twice when event source is called twice on the same period', function(done) {
      var sourceEvents = [{
        id: 'a',
        start: calMoment('2015-01-01T14:31:25.724Z'),
        end: calMoment('2015-01-01T15:31:25.724Z')
      }];
      var eventSource = function(_start, _end, _timezone, callback) {
        callback(sourceEvents);
      };

      eventSources.push(eventSource);

      var numTest = 0;
      var testEventSource = getService().events.bind(null, start, end, timezone, function(fakeEvents) {
        numTest++;
        var numFakeEvent = 0;
        var fakeEvent = {};

        fakeEvents.forEach(function(event) {
          expect(event.allDay).to.be.true;
          fakeEvent[event.start] = parseInt(event.title, 10);
          numFakeEvent++;
        });

        expect(fakeEvent['2015-01-01']).to.equals(1);
        expect(numFakeEvent).to.equals(1);
        (numTest === 2 ? done : testEventSource)();
      });

      testEventSource();
      $rootScope.$digest();
    });
  });
});
