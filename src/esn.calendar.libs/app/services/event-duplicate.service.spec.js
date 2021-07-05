'use strict';

/* global chai, sinon */

const { expect } = chai;

describe('the calEventDuplicateService service', () => {
  let $rootScope, calEventDuplicateService, CalendarShell, calMoment;
  let VideoConfConfigurationServiceMock, uuid4Mock, esnDatetimeService;

  beforeEach(() => {
    VideoConfConfigurationServiceMock = {
      getOpenPaasVideoconferenceAppUrl: sinon.stub().returns($q.when('some url'))
    };

    uuid4Mock = {
      _uuid: 'uuid4',
      generate: function() {
        return this._uuid;
      }
    };

    angular.mock.module('esn.calendar.libs');

    angular.mock.module(function($provide) {
      $provide.value('VideoConfConfigurationService', VideoConfConfigurationServiceMock);
      $provide.value('uuid4', uuid4Mock);
    });

    angular.mock.inject(function(_$rootScope_, _calEventDuplicateService_, _CalendarShell_, _calMoment_, _esnDatetimeService_) {
      $rootScope = _$rootScope_;
      calEventDuplicateService = _calEventDuplicateService_;
      CalendarShell = _CalendarShell_;
      calMoment = _calMoment_;
      esnDatetimeService = _esnDatetimeService_;
      esnDatetimeService.getTimeZone = function() {
        return 'Europe/Paris';
      };
    });
  });

  afterEach(() => {
    calEventDuplicateService.reset();
  });

  describe('the getDuplicateEventSource function', () => {
    it('should correctly return the stored event source calendarID', () => {
      calEventDuplicateService.setDuplicateEventSource('TEST');
      const result = calEventDuplicateService.getDuplicateEventSource();

      expect(result).to.eq('TEST');
    });

    it('should return null if no calendarID is stored', () => {
      const result = calEventDuplicateService.getDuplicateEventSource();

      expect(result).to.eq(null);
    });
  });

  describe('the setDuplicateEventSource function', () => {
    it('should correctly set the source calendarID correctly', () => {
      expect(calEventDuplicateService.getDuplicateEventSource()).to.eq(null);

      calEventDuplicateService.setDuplicateEventSource('123');

      expect(calEventDuplicateService.getDuplicateEventSource()).to.eq('123');
    });
  });

  describe('the reset function', () => {
    it('should correctly revert the calendarID back to the initial state', () => {
      calEventDuplicateService.setDuplicateEventSource('123');
      calEventDuplicateService.reset();

      expect(calEventDuplicateService.getDuplicateEventSource()).to.eq(null);
    });
  });

  describe('the duplicateEvent function', function() {
    let event, eventSkeleton;

    beforeEach(function() {
      eventSkeleton = {
        start: calMoment('2018-05-01 10:30'),
        end: calMoment('2018-05-01 14:30'),
        attendees: [
          {
            displayName: 'attendee1',
            email: 'user1@test.com',
            partstat: 'ACCEPTED',
            cutype: 'INDIVIDUAL'
          },
          {
            displayName: 'attendee2',
            email: 'user2@test.com',
            partstat: 'ACCEPTED',
            cutype: 'INDIVIDUAL'
          },
          {
            displayName: 'resource1',
            email: 'resource1@test.com',
            partstat: 'ACCEPTED',
            cutype: 'RESOURCE'
          }
        ],
        sequence: 2, // A property to ignore when copying
        xOpenpaasVideoconference: undefined
      };

      event = CalendarShell.fromIncompleteShell(eventSkeleton);
    });

    it('should create a new copy of the event details correctly', function(done) {
      eventSkeleton.alarm = { id: 'some_fake_alarm' };
      const shellStub = sinon.stub(CalendarShell, 'fromIncompleteShell').returns(eventSkeleton);

      calEventDuplicateService.duplicateEvent(event)
        .then(duplicatedEvent => {
          expect(duplicatedEvent.alarm).to.deep.equal(eventSkeleton.alarm);
          expect(duplicatedEvent.attendees).to.deep.equal([
            {
              displayName: 'attendee1',
              email: 'user1@test.com',
              partstat: 'NEEDS-ACTION',
              cutype: 'INDIVIDUAL'
            },
            {
              displayName: 'attendee2',
              email: 'user2@test.com',
              partstat: 'NEEDS-ACTION',
              cutype: 'INDIVIDUAL'
            },
            {
              displayName: 'resource1',
              email: 'resource1@test.com',
              partstat: 'ACCEPTED',
              cutype: 'RESOURCE'
            }
          ]);

          done();
        });

      $rootScope.$digest();

      const copiedEvent = shellStub.firstCall.args[0];

      expect(CalendarShell.fromIncompleteShell).to.have.been.calledWith({
        start: event.start,
        end: event.end,
        attendees: event.attendees
      });
      // Should ignore properties that cannot be edited in the form.
      expect(copiedEvent.sequence).to.be.undefined;
      // Should ignore properties with undefined values
      expect(copiedEvent.xOpenpaasVideoconference).to.be.undefined;
    });

    it('should generate a new video conference link if the original event had one', function(done) {
      event = CalendarShell.fromIncompleteShell({
        ...eventSkeleton,
        xOpenpaasVideoconference: 'SOMETHING' // an event with a video conference link
      });

      calEventDuplicateService.duplicateEvent(event)
        .then(duplicatedEvent => {
          expect(duplicatedEvent.xOpenpaasVideoconference).to.equal(`some url${uuid4Mock._uuid}`);

          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      $rootScope.$digest();

      expect(VideoConfConfigurationServiceMock.getOpenPaasVideoconferenceAppUrl).to.have.been.called;
    });

    it('should not generate a new video conference link if the original event didn\'t have one', function() {
      event = CalendarShell.fromIncompleteShell(eventSkeleton);

      calEventDuplicateService.duplicateEvent(event);

      expect(VideoConfConfigurationServiceMock.getOpenPaasVideoconferenceAppUrl).to.not.have.been.called;
    });
  });
});
