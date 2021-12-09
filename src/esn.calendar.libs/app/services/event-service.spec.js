'use strict';

/* global chai, sinon, _, __FIXTURES__: false */

var expect = chai.expect;

describe('The calEventService service', function() {
  var ICAL, calCachedEventSourceMock, calendarHomeId, calendarId, eventUUID, dtstart, dtend, calendarHomeServiceMock, calOpenEventFormMock;
  var self = this;
  let tokenAPIMock, calCalDAVURLServiceMock, fileSaveMock, calendarUtils;
  const REQUEST_HEADERS_BASE = { Authorization: 'Bearer jwt' };

  beforeEach(function() {
    self = this;
    calendarHomeId = '123456789';
    calendarId = '987654321';
    eventUUID = '00000000-0000-4000-a000-000000000000';
    dtstart = '2015-05-25T08:56:29+00:00';
    dtend = '2015-05-25T09:56:29+00:00';

    tokenAPIMock = {
      getNewToken: function() {
        return $q.when({ data: { token: '123' } });
      },
      getWebToken() {
        return $q.when({ data: 'jwt' });
      }
    };

    calCalDAVURLServiceMock = {
      getFrontendURL() {
        return $q.when('/dav/api');
      }
    };

    calCachedEventSourceMock = {
      registerAdd: sinon.spy(),
      registerDelete: sinon.spy(),
      registerUpdate: sinon.spy(),
      deleteRegistration: sinon.spy(),
      resetCache: sinon.spy()
    };

    self.gracePeriodService = {
      grace: function() {
        return $q.when();
      }
    };

    self.uuid4 = {
      _uuid: eventUUID,
      generate: function() {
        return this._uuid;
      }
    };

    self.closeNotificationMock = sinon.stub();

    self.notificationFactoryMock = {
      weakInfo: sinon.spy(),
      weakError: sinon.spy(),
      weakSuccess: sinon.spy(),
      strongInfo: sinon.stub().returns({ close: self.closeNotificationMock })
    };

    self.calendarEventEmitterMock = {
      activitystream: {
        emitPostedMessage: sinon.spy()
      },
      emitCreatedEvent: sinon.spy(),
      emitRemovedEvent: sinon.spy(),
      emitModifiedEvent: sinon.spy()
    };

    calendarHomeServiceMock = {
      getUserCalendarHomeId: sinon.stub().returns($q.when('1'))
    };

    calOpenEventFormMock = sinon.stub();

    fileSaveMock = {
      saveAs: sinon.spy()
    };

    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');
    angular.mock.module('esn.ical');

    angular.mock.module(function($provide) {
      $provide.value('tokenAPI', self.tokenAPI);
      $provide.value('uuid4', self.uuid4);
      $provide.value('notificationFactory', self.notificationFactoryMock);
      $provide.value('socket', self.socket);
      $provide.value('gracePeriodService', self.gracePeriodService);
      $provide.value('$modal', self.$modal);
      $provide.value('calCachedEventSource', calCachedEventSourceMock);
      $provide.value('calendarEventEmitter', self.calendarEventEmitterMock);
      $provide.value('gracePeriodLiveNotificationService', { start: angular.noop });
      $provide.value('calendarHomeService', calendarHomeServiceMock);
      $provide.value('calOpenEventForm', calOpenEventFormMock);
      $provide.value('esnI18nService', {
        getLocale: sinon.stub().returns('en'),
        translate: function(input) { return input; }
      });
      $provide.constant('CAL_GRACE_DELAY_IS_ACTIVE', self.CAL_GRACE_DELAY_IS_ACTIVE_MOCK);
      $provide.decorator('calMasterEventCache', function($delegate) {
        self.calMasterEventCache = {
          get: $delegate.get,
          remove: sinon.spy($delegate.remove),
          save: sinon.spy($delegate.save)
        };

        return self.calMasterEventCache;
      });
      $provide.value('tokenAPI', tokenAPIMock);
      $provide.value('calCalDAVURLService', calCalDAVURLServiceMock);
      $provide.value('FileSaver', fileSaveMock);
    });
  });

  beforeEach(inject(function(calEventService, $httpBackend, $rootScope, _ICAL_, _calendarUtils_, CalendarShell, calMoment, CAL_EVENTS, CAL_GRACE_DELAY, $window, esnI18nService, calEventAPI, calendarAPI, esnDatetimeService) {
    self.$httpBackend = $httpBackend;
    self.$rootScope = $rootScope;
    self.calEventService = calEventService;
    self.calEventAPI = calEventAPI;
    self.calendarAPI = calendarAPI;
    self.CalendarShell = CalendarShell;
    self.calMoment = calMoment;
    ICAL = _ICAL_;
    self.CAL_EVENTS = CAL_EVENTS;
    self.CAL_GRACE_DELAY = CAL_GRACE_DELAY;
    self.$window = $window;
    self.esnI18nService = esnI18nService;
    self.esnDatetimeService = esnDatetimeService;
    self.esnDatetimeService.getTimeZone = function() {
      return 'Europe/Paris';
    };

    self.CAL_GRACE_DELAY_IS_ACTIVE_MOCK = true;
    calendarUtils = _calendarUtils_;

    calendarUtils.notifyErrorWithRefreshCalendarButton = sinon.stub();
  }));

  function getEventPath(home, id) {
    return '/dav/api/calendars/' + (home || calendarHomeId) + '/' + (id || calendarId) + '/' + eventUUID + '.ics';
  }

  describe('The listEvents fn', function() {

    it('should list non-recurring events', function(done) {
      var data = {
        match: { start: '20140101T000000', end: '20140102T000000' }
      };

      this.$httpBackend.expect('REPORT', '/dav/api/calendars/uid/events.json', data).respond({
        _links: {
          self: { href: '/prepath/path/to/calendar.json' }
        },
        _embedded: {
          'dav:item': [{
            _links: {
              self: { href: '/prepath/path/to/calendar/myuid.ics' }
            },
            etag: '"123123"',
            data: [
              'vcalendar', [], [
                ['vevent', [
                  ['uid', {}, 'text', 'myuid'],
                  ['summary', {}, 'text', 'title'],
                  ['location', {}, 'text', 'location'],
                  ['dtstart', {}, 'date-time', '2014-01-01T02:03:04'],
                  ['dtend', {}, 'date-time', '2014-01-01T03:03:04']
                ], []]
              ]
            ]
          }]
        }
      });

      var start = self.calMoment(new Date(2014, 0, 1));
      var end = self.calMoment(new Date(2014, 0, 2));

      self.calEventService.listEvents('/calendars/uid/events.json', start, end, false).then(function(events) {
        expect(events).to.be.an.array;
        expect(events.length).to.equal(1);
        expect(events[0].id).to.equal('myuid');
        expect(events[0].uid).to.equal('myuid');
        expect(events[0].title).to.equal('title');
        expect(events[0].location).to.equal('location');
        expect(events[0].start.toDate()).to.equalDate(self.calMoment('2014-01-01 02:03:04').toDate());
        expect(events[0].end.toDate()).to.equalDate(self.calMoment('2014-01-01 03:03:04').toDate());
        expect(events[0].vcalendar).to.be.an('object');
        expect(events[0].vevent).to.be.an('object');
        expect(events[0].etag).to.equal('"123123"');
        expect(events[0].path).to.equal('/prepath/path/to/calendar/myuid.ics');
      }).finally(done);

      self.$httpBackend.flush();
    });

    it('should list recurring events', function(done) {
      var data = {
        match: { start: '20140101T000000', end: '20140103T000000' }
      };

      this.$httpBackend.expect('REPORT', '/dav/api/calendars/uid/events.json', data).respond({
        _links: {
          self: { href: '/prepath/path/to/calendar.json' }
        },
        _embedded: {
          'dav:item': [{
            _links: {
              self: { href: '/prepath/path/to/calendar/myuid.ics' }
            },
            etag: '"123123"',
            data: [
              'vcalendar', [], [
                ['vevent', [
                  ['uid', {}, 'text', 'myuid'],
                  ['summary', {}, 'text', 'title'],
                  ['location', {}, 'text', 'location'],
                  ['dtstart', {}, 'date-time', '2014-01-01T02:03:04'],
                  ['dtend', {}, 'date-time', '2014-01-01T03:03:04'],
                  ['recurrence-id', {}, 'date-time', '2014-01-01T02:03:04']
                ], []],
                ['vevent', [
                  ['uid', {}, 'text', 'myuid'],
                  ['summary', {}, 'text', 'title'],
                  ['location', {}, 'text', 'location'],
                  ['dtstart', {}, 'date-time', '2014-01-02T02:03:04'],
                  ['dtend', {}, 'date-time', '2014-01-02T03:03:04'],
                  ['recurrence-id', {}, 'date-time', '2014-01-02T02:03:04']
                ], []]
              ]
            ]
          }]
        }
      });

      var start = self.calMoment(new Date(2014, 0, 1));
      var end = self.calMoment(new Date(2014, 0, 3));

      self.calEventService.listEvents('/calendars/uid/events.json', start, end, false).then(function(events) {
        expect(events).to.be.an.array;
        expect(events.length).to.equal(2);
        expect(events[0].uid).to.equal('myuid');
        expect(events[0].isInstance()).to.be.true;
        expect(events[0].id).to.equal('myuid_2014-01-01T02:03:04Z');
        expect(events[0].start.toDate()).to.equalDate(self.calMoment('2014-01-01 02:03:04').toDate());
        expect(events[0].end.toDate()).to.equalDate(self.calMoment('2014-01-01 03:03:04').toDate());
        expect(events[0].vcalendar).to.be.an('object');
        expect(events[0].vevent).to.be.an('object');
        expect(events[0].etag).to.equal('"123123"');
        expect(events[0].path).to.equal('/prepath/path/to/calendar/myuid.ics');

        expect(events[1].uid).to.equal('myuid');
        expect(events[1].isInstance()).to.be.true;
        expect(events[1].id).to.equal('myuid_2014-01-02T02:03:04Z');
        expect(events[1].start.toDate()).to.equalDate(self.calMoment('2014-01-02 02:03:04').toDate());
        expect(events[1].end.toDate()).to.equalDate(self.calMoment('2014-01-02 03:03:04').toDate());
        expect(events[1].vcalendar).to.be.an('object');
        expect(events[1].vevent).to.be.an('object');
        expect(events[1].etag).to.equal('"123123"');
        expect(events[1].path).to.equal('/prepath/path/to/calendar/myuid.ics');
      }).finally(done);

      self.$httpBackend.flush();
    });
  });

  describe('The getEvent fn', function() {

    it('should return an event', function(done) {
      // The caldav server will be hit
      self.$httpBackend.expectGET(/^\/dav\/api\/path\/to\/event.ics/).respond(
        ['vcalendar', [], [
          ['vevent', [
            ['uid', {}, 'text', 'myuid'],
            ['summary', {}, 'text', 'title'],
            ['location', {}, 'text', 'location'],
            ['dtstart', {}, 'date-time', '2014-01-01T02:03:04'],
            ['dtend', {}, 'date-time', '2014-01-01T03:03:04'],
            ['attendee', { partstat: 'ACCEPTED', cn: 'name' }, 'cal-address', 'mailto:test@example.com'],
            ['attendee', { partstat: 'DECLINED' }, 'cal-address', 'mailto:noname@example.com'],
            ['attendee', { partstat: 'YOLO' }, 'cal-address', 'mailto:yolo@example.com'],
            ['organizer', { cn: 'organizer' }, 'cal-address', 'mailto:organizer@example.com']
          ], []]
        ]],
        // headers:
        { ETag: 'testing-tag' }
      );

      self.calEventService.getEvent('/path/to/event.ics').then(function(event) {
        expect(event).to.be.an('object');
        expect(event.id).to.equal('myuid');
        expect(event.title).to.equal('title');
        expect(event.location).to.equal('location');
        expect(event.allDay).to.be.false;
        expect(event.start.toDate()).to.equalDate(new Date(2014, 0, 1, 2, 3, 4));
        expect(event.end.toDate()).to.equalDate(new Date(2014, 0, 1, 3, 3, 4));

        expect(event.attendees).to.deep.equal([
          {
            fullmail: 'name <test@example.com>',
            email: 'test@example.com',
            name: 'name',
            partstat: 'ACCEPTED',
            displayName: 'name',
            cutype: 'INDIVIDUAL'
          },
          {
            fullmail: 'noname@example.com',
            email: 'noname@example.com',
            name: 'noname@example.com',
            partstat: 'DECLINED',
            displayName: 'noname@example.com',
            cutype: 'INDIVIDUAL'
          },
          {
            fullmail: 'yolo@example.com',
            email: 'yolo@example.com',
            name: 'yolo@example.com',
            partstat: 'YOLO',
            displayName: 'yolo@example.com',
            cutype: 'INDIVIDUAL'
          }
        ]);

        expect(event.organizer).to.deep.equal({
          fullmail: 'organizer <organizer@example.com>',
          email: 'organizer@example.com',
          name: 'organizer',
          displayName: 'organizer'
        });

        expect(event.vcalendar).to.be.an('object');
        expect(event.path).to.equal('/path/to/event.ics');
        expect(event.etag).to.equal('testing-tag');
      }).finally(done);

      self.$httpBackend.flush();
    });
  });

  describe('The create fn', function() {
    var calendar;

    beforeEach(function() {
      calendar = {
        calendarHomeId: calendarHomeId,
        id: calendarId,
        isSubscription: function() {
          return false;
        }
      };
    });

    it('should fail on 500 response status', function() {
      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(500, '');

      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vcalendar.addSubcomponent(vevent);
      var event = new self.CalendarShell(vcalendar);

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      var catchSpy = sinon.spy();

      self.calEventService.createEvent(calendar, event, { graceperiod: true }).catch(catchSpy);
      self.$httpBackend.flush();

      expect(catchSpy).to.have.been.calledWith(sinon.match({ status: 500 }));
    });

    it('should fail on a 2xx status that is not 202', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vcalendar.addSubcomponent(vevent);
      var event = new self.CalendarShell(vcalendar);

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(200, '');

      var catchSpy = sinon.spy();

      self.calEventService.createEvent(calendar, event, { graceperiod: true }).catch(catchSpy);
      self.$httpBackend.flush();

      expect(catchSpy).to.have.been.calledWith(sinon.match({ status: 200 }));
    });

    it('should succeed when everything is correct and return true', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vevent.addPropertyWithValue('dtend', dtend);
      vevent.addPropertyWithValue('summary', 'test event');
      vcalendar.addSubcomponent(vevent);
      var path = getEventPath();
      var etag = 'ETAG';
      var gracePeriodTaskId = '123456789';
      var calendarShell = new self.CalendarShell(vcalendar, {
        path: path,
        etag: etag
      });

      self.gracePeriodService.grace = function() {
        return $q.when({
          cancelled: false
        });
      };
      self.gracePeriodService.remove = function(taskId) {
        expect(taskId).to.equal(gracePeriodTaskId);
      };

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: gracePeriodTaskId });

      var thenSpy = sinon.spy();

      self.calEventService.createEvent(calendar, calendarShell, { graceperiod: true, notifyFullcalendar: true }).then(thenSpy);
      self.$httpBackend.flush();

      expect(thenSpy).to.have.been.calledWith(true);
      expect(self.calendarEventEmitterMock.emitCreatedEvent).to.have.been.called;
    });

    it('should send request to the source calendar if calendar.source is defined', function() {
      calendar.isSubscription = function() { return true; };
      var sourceHomeId = 'thesourcehomeid';
      var sourceId = 'thesourceid';
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vevent.addPropertyWithValue('dtend', dtend);
      vevent.addPropertyWithValue('summary', 'test event');
      vcalendar.addSubcomponent(vevent);
      var path = getEventPath();
      var etag = 'ETAG';
      var gracePeriodTaskId = '123456789';
      var calendarShell = new self.CalendarShell(vcalendar, {
        path: path,
        etag: etag
      });

      self.gracePeriodService.grace = function() {
        return $q.when({
          cancelled: false
        });
      };
      self.gracePeriodService.remove = function(taskId) {
        expect(taskId).to.equal(gracePeriodTaskId);
      };

      self.$httpBackend.expectPUT(getEventPath(sourceHomeId, sourceId) + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: gracePeriodTaskId });
      calendar.source = {
        id: sourceId,
        calendarHomeId: sourceHomeId
      };

      var thenSpy = sinon.spy();

      self.calEventService.createEvent(calendar, calendarShell, { graceperiod: true, notifyFullcalendar: true }).then(thenSpy);
      self.$httpBackend.flush();

      expect(thenSpy).to.have.been.calledWith(true);
      expect(self.calendarEventEmitterMock.emitCreatedEvent).to.have.been.called;
    });

    it('should resolve false if the graceperiod fail (user cancel or error)', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vevent.addPropertyWithValue('dtend', dtend);
      vcalendar.addSubcomponent(vevent);

      var event = new self.CalendarShell(vcalendar);
      var gracePeriodTaskId = '123456789';

      self.gracePeriodService.grace = function() {
        return $q.reject({});
      };

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: gracePeriodTaskId });

      var spy = sinon.spy();

      self.calEventService.createEvent(calendar, event, { graceperiod: true }).then(spy);
      self.$httpBackend.flush();

      expect(spy).to.have.been.calledWith(false);
      expect(self.calendarEventEmitterMock.emitRemovedEvent).to.have.been.called;
    });

    it('should display an error notification when the request to create the event fails', function(done) {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vevent.addPropertyWithValue('dtend', dtend);
      vcalendar.addSubcomponent(vevent);

      var event = new self.CalendarShell(vcalendar);

      self.gracePeriodService.grace = function() {
        return $q.resolve();
      };

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(500);

      self.calEventService.createEvent(calendar, event, { graceperiod: true })
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err).to.exist;
          expect(calendarUtils.notifyErrorWithRefreshCalendarButton).to.have.been.calledWith('Event creation failed. Please refresh your calendar');
          done();
        });

      self.$httpBackend.flush();
    });

    it('should call calCachedEventSource.registerAdd', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vcalendar.addSubcomponent(vevent);
      var event = new self.CalendarShell(vcalendar);

      self.gracePeriodService.grace = $q.when.bind(null, {});

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var spy = sinon.spy();

      self.calEventService.createEvent(calendar, event, { graceperiod: true }).then(spy);
      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.registerAdd).to.have.been.calledWith(event);
      expect(spy).to.have.been.called;
    });

    it('should call calMasterEventCache.save if and only if it is a recurring event', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vcalendar.addSubcomponent(vevent);
      var event = new self.CalendarShell(vcalendar);

      event.isRecurring = _.constant(true);

      self.gracePeriodService.grace = $q.when.bind(null, {
        cancelled: true,
        success: angular.noop
      });

      self.gracePeriodService.cancel = $q.when.bind(null, {});

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.createEvent(calendar, event, { graceperiod: true });

      self.$httpBackend.flush();

      event.isRecurring = _.constant(false);

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.createEvent(calendar, event, { graceperiod: true });

      self.$httpBackend.flush();

      expect(self.calMasterEventCache.save).to.have.been.calledOnce;
      expect(self.calMasterEventCache.save).to.have.been.calledWith(event);
    });

    it('should call calCachedEventSource.deleteRegistration if the creation is cancelled', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vcalendar.addSubcomponent(vevent);
      var event = new self.CalendarShell(vcalendar);

      self.gracePeriodService.grace = $q.reject.bind(null, {});

      calCachedEventSourceMock.deleteRegistration = sinon.spy();

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      self.calEventService.createEvent(calendar, event, { graceperiod: true });
      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.deleteRegistration).to.have.been.calledWith(event);
    });

    it('should call calMasterEventCache.remove if the creation is cancelled and if and only if event is a recurring event', function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('dtstart', dtstart);
      vcalendar.addSubcomponent(vevent);
      var event = new self.CalendarShell(vcalendar);

      self.gracePeriodService.grace = $q.reject.bind(null, {});

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      event.isRecurring = _.constant(true);
      self.calEventService.createEvent(calendar, event, { graceperiod: true });
      self.$httpBackend.flush();

      self.$httpBackend.expectPUT(getEventPath() + '?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      event.isRecurring = _.constant(false);
      self.calEventService.createEvent(calendar, event, { graceperiod: true });
      self.$httpBackend.flush();

      expect(self.calMasterEventCache.remove).to.have.been.calledOnce;
      expect(self.calMasterEventCache.remove).to.have.been.calledWith(event);
    });
  });

  describe('The modify fn', function() {
    function unexpected(done) {
      done(new Error('Unexpected'));
    }

    beforeEach(function() {
      var attendees = [
        { emails: ['user1@lng.com'], partstat: 'ACCEPTED' },
        { emails: ['user2@lng.com'], partstat: 'NEEDS-ACTION' }
      ];
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('summary', 'test event');
      vevent.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(new Date())).setParameter('tzid', 'Europe/Paris');
      vevent.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(new Date())).setParameter('tzid', 'Europe/Paris');
      vevent.addPropertyWithValue('transp', 'OPAQUE');
      attendees.forEach(function(attendee) {
        var mailto = 'mailto:' + attendee.emails[0];
        var property = vevent.addPropertyWithValue('attendee', mailto);

        property.setParameter('partstat', attendee.partstat);
        property.setParameter('rsvp', 'TRUE');
        property.setParameter('role', 'REQ-PARTICIPANT');
      });
      vcalendar.addSubcomponent(vevent);
      self.vcalendar = vcalendar;
      self.vevent = vevent;

      self.event = new self.CalendarShell(self.vcalendar, {
        path: '/path/to/uid.ics'
      });
      self.oldEvent = self.event.clone();
      self.oldEvent.start = self.event.start.clone().add(1, 'hour');
    });

    it('should fail if status is not 202', function(done) {
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(200);

      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.event, 'etag', angular.noop, { notifyFullcalendar: true }).then(
        unexpected.bind(null, done), function(response) {
          expect(response.status).to.equal(200);
          done();
        }
      );

      self.$httpBackend.flush();
    });

    it('should succeed on 202 and return true', function() {
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      self.gracePeriodService.grace = function() {
        return $q.when({});
      };

      var spy = sinon.spy();

      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.event, 'etag', angular.noop, { notifyFullcalendar: true }).then(spy);

      self.$httpBackend.flush();
      expect(self.calendarEventEmitterMock.emitModifiedEvent).to.have.been.called;
    });

    it('should provide a link to refresh the browser if graceperiod fail', function() {
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      self.gracePeriodService.grace = sinon.stub().returns($q.when());

      var spy = sinon.spy();

      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.event, 'etag', angular.noop, { notifyFullcalendar: true }).then(spy);

      self.$httpBackend.flush();
      expect(self.gracePeriodService.grace).to.have.been.calledWith(sinon.match({
        gracePeriodFail: {
          text: 'Event modification failed. Please refresh your calendar',
          actionText: 'Refresh calendar',
          delay: -1,
          hideCross: true,
          action: sinon.match.func.and(sinon.match(function(action) {
            var onSpy = sinon.spy();

            self.$rootScope.$on(self.CAL_EVENTS.CALENDAR_REFRESH, onSpy);
            action();

            expect(calCachedEventSourceMock.resetCache).to.have.been.calledOnce;
            expect(onSpy).to.have.been.calledOnce;

            return true;
          }))
        }
      }));
    });

    it('should save event on calMasterEventCache if and only if it is a recurring event', function() {
      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.event.isRecurring = _.constant(true);
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.event, 'etag', angular.noop, { notifyFullcalendar: true });

      self.$httpBackend.flush();

      self.event.isRecurring = _.constant(false);
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.event, 'etag', angular.noop, { notifyFullcalendar: true });

      self.$httpBackend.flush();
      expect(self.calMasterEventCache.save).to.have.been.calledOnce;
      expect(self.calMasterEventCache.save).to.have.been.calledWith(self.event);
    });

    it('should be able to modify an instance', function() {
      var occShell = this.event.clone();

      occShell.recurrenceId = this.calMoment([2017, 1, 1, 1, 1]);
      occShell.start = occShell.start.add(30, 'minutes');

      var headers = { ETag: 'etag' };
      var vcalendar = _.cloneDeep(self.vcalendar.toJSON());
      var $httpBackend = self.$httpBackend;

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      this.gracePeriodService.remove = sinon.spy();

      var modifyEventThen = sinon.spy();

      this.calEventService.modifyEvent('/path/to/uid.ics', occShell, occShell, 'etag', angular.noop, { notifyFullcalendar: true }).then(modifyEventThen);

      function checkPUT(data) {
        vcalendar = new ICAL.Component(JSON.parse(data));

        return vcalendar.getAllSubcomponents('vevent').length === 2;
      }

      $httpBackend.whenGET(/^\/dav\/api\/path\/to\/uid.ics/).respond(200, vcalendar, headers);
      $httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY, checkPUT).respond(202, { id: '123456789' });
      $httpBackend.flush();

      expect(modifyEventThen).to.have.been.calledWith(true);
    });

    it('should send etag as If-Match header', function() {
      var requestHeaders = {
        ...REQUEST_HEADERS_BASE,
        'Content-Type': 'application/calendar+json',
        Prefer: 'return=representation',
        'If-Match': 'etag',
        Accept: 'application/json, text/plain, */*'
      };

      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY, self.vcalendar.toJSON(), requestHeaders).respond(202, { id: '123456789' }, { ETag: 'changed-etag' });

      self.gracePeriodService.grace = function() {
        return $q.when({
          cancelled: false
        });
      };

      self.gracePeriodService.remove = function(taskId) {
        expect(taskId).to.equal('123456789');
      };

      var spy = sinon.spy();

      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.event, 'etag', angular.noop, { notifyFullcalendar: true }).then(spy);

      self.$httpBackend.flush();
      expect(spy).to.have.been.calledWith(true);

    });

    it('should reset the attendees participation if hasSignificantChange parameter is true', function() {
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY, function(data) {
        var vcalendar = new ICAL.Component(JSON.parse(data));
        var vevent = vcalendar.getFirstSubcomponent('vevent');

        vevent.getAllProperties('attendee').forEach(function(att) {
          expect(att.getParameter('partstat')).to.equal('NEEDS-ACTION');
        });

        return true;
      }).respond(202, { id: '123456789' });

      self.gracePeriodService.grace = function() {
        return $q.when({
          cancelled: false
        });
      };

      var spy = sinon.spy();

      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.oldEvent, 'etag', angular.noop, { notifyFullcalendar: true }).then(spy);

      self.$httpBackend.flush();
      expect(spy).to.have.been.calledWith(true);
    });

    it('should raise the sequence if hasSignificantChange parameter is true', function() {
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY, function(data) {
        var vcalendar = new ICAL.Component(JSON.parse(data));
        var vevent = vcalendar.getFirstSubcomponent('vevent');

        expect(vevent.getFirstPropertyValue('sequence')).to.equal(1);

        return true;
      }).respond(202, { id: '123456789' });

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.gracePeriodService.remove = function(taskId) {
        expect(taskId).to.equal('123456789');
      };

      var spy = sinon.spy();

      self.calEventService.modifyEvent('/path/to/uid.ics', self.event, self.oldEvent, 'etag', angular.noop, { notifyFullcalendar: true }).then(spy);
      self.$httpBackend.flush();

      expect(spy).to.have.been.calledWith(true);

    });

    it('should cancel the task if event is involved in a graceperiod', function() {
      self.gracePeriodService.cancel = sinon.spy();
      var gracePeriodTaskId, event = self.event.clone();

      event.gracePeriodTaskId = '12345';
      gracePeriodTaskId = event.gracePeriodTaskId;
      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', event, event, 'etag', angular.noop, { notifyFullcalendar: true });
      self.$httpBackend.flush();

      expect(self.gracePeriodService.cancel).to.have.been.calledWith(gracePeriodTaskId);
    });

    it('should call given cancelCallback when graceperiod is cancelled before calling calendarEventEmitter.emitModifiedEvent', function() {

      self.gracePeriodService.grace = function() {
        self.calendarEventEmitterMock.emitModifiedEvent = sinon.spy();

        return $q.reject();
      };

      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var onCancel = sinon.spy();

      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', self.event, self.event, 'etag', onCancel, { notifyFullcalendar: true });

      self.$httpBackend.flush();

      expect(onCancel).to.have.been.calledOnce;
      expect(self.calendarEventEmitterMock.emitModifiedEvent).to.have.been.calledOnce;
    });

    it('should display an error notification when the request to modify the event fails', function(done) {
      self.gracePeriodService.grace = () => $q.resolve();

      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(500);

      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', self.event, self.event, 'etag')
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err).to.exist;
          expect(calendarUtils.notifyErrorWithRefreshCalendarButton).to.have.been.calledWith('Event modification failed. Please refresh your calendar');
          done();
        });

      self.$httpBackend.flush();
    });

    it('should call calCachedEventSource.registerUpdate', function() {

      self.gracePeriodService.grace = $q.when.bind(null, {
        cancelled: true,
        success: angular.noop
      });

      self.gracePeriodService.cancel = $q.when.bind(null, {});

      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var event = self.event;
      var spy = sinon.spy();

      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', event, event, 'etag', angular.noop, { notifyFullcalendar: true }).then(spy);

      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.registerUpdate).to.have.been.calledWith(event);
      expect(spy).to.have.been.calledOnce;
    });

    it('should call calCachedEventSource.registerUpdate again with the oldEvent if the modification is cancelled', function() {

      self.gracePeriodService.grace = $q.reject.bind(null);

      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var event = self.event;

      event.isRecurring = _.constant(true);
      var oldEvent = self.event.clone();

      calCachedEventSourceMock.registerUpdate = sinon.spy();

      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', event, oldEvent, 'etag', angular.noop, { notifyFullcalendar: true });
      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.registerUpdate.firstCall).to.have.been.calledWith(sinon.match.same(event));
      expect(calCachedEventSourceMock.registerUpdate.secondCall).to.have.been.calledWith(sinon.match.same(oldEvent));
    });

    it('should call calCachedEventSource.registerUpdate again with the first oldEvent if the event has been modified multiple times during the graceperiod and is cancelled', function() {

      self.gracePeriodService.grace = sinon.stub();
      self.gracePeriodService.grace.onCall(0).returns($q.defer().promise);
      self.gracePeriodService.grace.onCall(1).returns($q.reject());
      calCachedEventSourceMock.registerUpdate = sinon.spy();
      self.gracePeriodService.cancel = sinon.spy();

      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var event = self.event.clone();

      event.start = self.calMoment(new Date(2016, 1, 1));
      var firstOldEvent = self.event.clone();

      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', event, firstOldEvent, 'etag', angular.noop, { notifyFullcalendar: true });

      self.$httpBackend.flush();
      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var secondEvent = event.clone();

      secondEvent.start = self.calMoment(new Date(2016, 1, 3));

      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', secondEvent, event, 'etag', angular.noop, { notifyFullcalendar: true });

      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.registerUpdate).to.have.been.calledThrice;
      expect(calCachedEventSourceMock.registerUpdate.firstCall).to.have.been.calledWith(sinon.match.same(event));
      expect(calCachedEventSourceMock.registerUpdate.secondCall).to.have.been.calledWith(sinon.match.same(secondEvent));
      expect(calCachedEventSourceMock.registerUpdate.thirdCall).to.have.been.calledWith(sinon.match.same(firstOldEvent));
      expect(self.gracePeriodService.cancel).to.have.been.calledOnce;
    });

    it('should call calMasterEventCache.save on old event if the creation is cancelled if and only if oldEvent is recurring', function() {

      self.gracePeriodService.grace = $q.reject.bind(null);

      var oldEvent = self.event.clone();

      oldEvent.isRecurring = _.constant(true);
      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', self.event, oldEvent, 'etag', angular.noop, { notifyFullcalendar: true });
      self.$httpBackend.flush();

      oldEvent.isRecurring = _.constant(false);
      self.$httpBackend.expectPUT('/dav/api/path/to/calendar/uid.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });
      self.calEventService.modifyEvent('/path/to/calendar/uid.ics', self.event, oldEvent, 'etag', angular.noop, { notifyFullcalendar: true });
      self.$httpBackend.flush();

      expect(self.calMasterEventCache.save).to.have.been.calledWith(sinon.match.same(oldEvent));
      expect(self.calMasterEventCache.save).to.have.been.calledOnce;
    });
  });

  describe('The remove fn', function() {

    beforeEach(function() {
      var vcalendar = new ICAL.Component('vcalendar');

      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('summary', 'test event');
      vcalendar.addSubcomponent(vevent);

      self.vcalendar = vcalendar;

      self.event = {
        id: eventUUID,
        title: 'test event',
        start: self.calMoment(),
        end: self.calMoment(),
        isInstance: _.constant(false)
      };

      self.cloneOfMaster = {
        equals: _.constant(false),
        deleteInstance: sinon.spy()
      };

      self.master = {
        expand: _.constant({ length: 2 }),
        clone: sinon.stub().returns(self.cloneOfMaster)
      };

      self.instanceEvent = {
        isInstance: _.constant(true),
        getModifiedMaster: sinon.stub().returns($q.when(self.master))
      };

    });

    it('should fail if status is not 202', function() {
      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(201);

      var errorSpy = sinon.spy();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag').catch(errorSpy);
      self.$httpBackend.flush();

      expect(errorSpy).to.have.been.calledWith(sinon.match({ status: 201 }));
    });

    it('should display an error notification when the request to remove the event fails', function(done) {
      self.$httpBackend.expectDELETE(`/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=${self.CAL_GRACE_DELAY}`).respond(500);

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag')
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err).to.exist;
          expect(calendarUtils.notifyErrorWithRefreshCalendarButton).to.have.been.calledWith('Event deletion failed. Please refresh your calendar');
          done();
        });

      self.$httpBackend.flush();
    });

    it('should cancel the task if there is no etag and if it is not a recurring', function() {
      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.gracePeriodService.cancel = sinon.spy(function() {
        return $q.when();
      });

      var thenSpy = sinon.spy();

      self.event.gracePeriodTaskId = 'taskId';
      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event).then(thenSpy);
      self.$rootScope.$apply();

      expect(thenSpy).to.have.been.calledWith(true);
      expect(calCachedEventSourceMock.deleteRegistration).to.have.been.calledWith(self.event);
      expect(self.calendarEventEmitterMock.emitRemovedEvent).to.have.been.calledWith(self.event.id);
      expect(self.gracePeriodService.cancel).to.have.been.calledWith(self.event.gracePeriodTaskId);
      expect(self.notificationFactoryMock.weakInfo).to.have.been.calledWith('Calendar', '%s has been deleted.');
    });

    it('should cancel the task if event is involved in a graceperiod', function() {
      self.gracePeriodService.cancel = sinon.spy();
      var event = angular.copy(self.event);

      event.gracePeriodTaskId = '12345';
      var gracePeriodId = event.gracePeriodTaskId;

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag');
      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(201);
      self.$httpBackend.flush();

      expect(self.gracePeriodService.cancel).to.have.been.calledWith(gracePeriodId);
    });

    it('should succeed on 202 and send a websocket event', function() {

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.gracePeriodService.remove = function(taskId) {
        expect(taskId).to.equal('123456789');
      };

      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      var spy = sinon.spy();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag').then(spy);

      self.$httpBackend.flush();

      expect(spy).to.have.been.calledWith(true);
      expect(self.calendarEventEmitterMock.emitRemovedEvent).to.have.been.called;
    });

    it('should call calCachedEventSource.registerDelete', function() {
      var spy = sinon.spy();

      self.gracePeriodService.grace = $q.when.bind(null);
      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag').then(spy);
      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.registerDelete).to.have.been.calledWith(self.event);
      expect(spy).to.have.been.calledWith(true);
    });

    it('should call calCachedEventSource.deleteRegistration if the creation is cancelled', function() {
      self.gracePeriodService.grace = $q.reject.bind(null);

      calCachedEventSourceMock.deleteRegistration = sinon.spy();

      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag');
      self.$httpBackend.flush();

      expect(calCachedEventSourceMock.deleteRegistration).to.have.been.calledWith(self.event);
    });

    it('should succeed on 202', function() {
      var taskId = '123456789';

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: taskId });

      var spy = sinon.spy();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag').then(spy);
      self.$httpBackend.flush();

      expect(spy).to.have.been.calledWith(true);
    });

    it('should delegate on modifyEvent for instance of recurring after deleting subevent from master shell even if no etag', function() {
      var modifyEventAnswer = {};

      var successCallback = sinon.spy();

      self.calEventService.modifyEvent = sinon.stub().returns($q.when(modifyEventAnswer));
      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.instanceEvent, 'etag').then(successCallback);

      self.$rootScope.$apply();

      self.instanceEvent.getModifiedMaster.reset();
      self.master.clone.reset();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.instanceEvent).then(successCallback);

      self.$rootScope.$apply();

      expect(successCallback).to.have.been.calledTwice;
      expect(successCallback).to.have.been.always.calledWith(sinon.match.same(modifyEventAnswer));
      expect(self.instanceEvent.getModifiedMaster).to.have.been.calledOnce;
      expect(self.master.clone).to.have.been.calledOnce;
      expect(self.cloneOfMaster.deleteInstance).to.have.been.calledWith(self.instanceEvent);
    });

    it('should remove master of event if event is the only instance of a recurring event', function() {
      var taskId = '123456789';

      self.master.expand = _.constant({ length: 1 });

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: taskId });

      var thenSpy = sinon.spy();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.instanceEvent, 'etag').then(thenSpy);
      self.$httpBackend.flush();

      expect(thenSpy).to.have.been.calledWith(true);
    });

    it('should remove master of event if removeAllInstance is true even if event is not the only instance of a recurring event', function() {
      var taskId = '123456789';

      self.gracePeriodService.grace = function() {
        return $q.when();
      };

      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: taskId });

      var thenSpy = sinon.spy();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.instanceEvent, 'etag', true).then(thenSpy);
      self.$httpBackend.flush();

      expect(thenSpy).to.have.been.calledWith(true);
    });

    it('should provide a link to refresh the browser if graceperiod fail', function() {
      self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics?graceperiod=' + self.CAL_GRACE_DELAY).respond(202, { id: '123456789' });

      self.gracePeriodService.grace = sinon.stub().returns($q.when());

      var thenSpy = sinon.spy();
      var onSpy = sinon.spy();

      self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', self.event, 'etag').then(thenSpy);
      self.$rootScope.$on(self.CAL_EVENTS.CALENDAR_REFRESH, onSpy);

      self.$httpBackend.flush();
      expect(self.gracePeriodService.grace).to.have.been.calledWith(sinon.match({
        gracePeriodFail: {
          text: 'Event deletion failed. Please refresh your calendar',
          delay: -1,
          hideCross: true,
          actionText: 'Refresh calendar',
          action: sinon.match.func.and(sinon.match(function(action) {
            action();

            return true;
          }))
        }
      }));

      expect(calCachedEventSourceMock.resetCache).to.have.been.calledOnce;
      expect(onSpy).to.have.been.calledOnce;
    });

  });

  describe('The changeParticipation fn', function() {
    function unexpected(done) {
      done(new Error('Unexpected'));
    }

    beforeEach(function() {
      var vcalendar = new ICAL.Component('vcalendar');
      var vevent = new ICAL.Component('vevent');

      vevent.addPropertyWithValue('uid', eventUUID);
      vevent.addPropertyWithValue('summary', 'test event');
      vevent.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(self.calMoment().toDate())).setParameter('tzid', self.esnDatetimeService.getTimeZone());
      vevent.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(self.calMoment().toDate())).setParameter('tzid', self.esnDatetimeService.getTimeZone());
      vevent.addPropertyWithValue('transp', 'OPAQUE');
      vevent.addPropertyWithValue('location', 'test location');
      vcalendar.addSubcomponent(vevent);
      self.vcalendar = vcalendar;
      self.event = new self.CalendarShell(self.vcalendar);
    });

    it('should return null if event.attendees is an empty array', function(done) {
      var emails = ['test@example.com'];

      self.event.attendees = [];

      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'ACCEPTED').then(function(response) {
        expect(response).to.be.null;
        done();
      }, unexpected.bind(null, done));

      self.$httpBackend.flush();
    });

    it('should change the participation status', function(done) {

      var emails = ['test@example.com'];
      var copy = new ICAL.Component(ICAL.helpers.clone(self.vcalendar.jCal, true));
      var vevent = copy.getFirstSubcomponent('vevent');
      var att = vevent.addPropertyWithValue('attendee', 'mailto:test@example.com');

      att.setParameter('partstat', 'ACCEPTED');
      att.setParameter('rsvp', 'TRUE');
      att.setParameter('role', 'REQ-PARTICIPANT');
      att.setParameter('cutype', 'INDIVIDUAL');
      self.event.attendees = [{ emails: emails }];
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics', copy.toJSON()).respond(200, new ICAL.Component('vcalendar').jCal);

      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'ACCEPTED').then(
        function(response) {
          expect(response).to.exist;
          done();
        }, unexpected.bind(null, done)
      );

      self.$httpBackend.flush();
    });

    it('should not change the participation status when the status is the actual attendee status', function() {
      var emails = ['test@example.com'];

      var promiseSpy = sinon.spy();

      self.event.attendees = [{ emails: emails, partstat: 'DECLINED' }];
      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'DECLINED').then(promiseSpy);
      self.$rootScope.$apply();

      expect(promiseSpy).to.have.been.calledWith(null);
    });

    it.skip('should retry participation change on 412', function(done) {

      var emails = ['test@example.com'];
      var copy = new ICAL.Component(ICAL.helpers.clone(self.vcalendar.jCal, true));
      var vevent = copy.getFirstSubcomponent('vevent');
      var att = vevent.getFirstProperty('attendee');

      att.setParameter('partstat', 'ACCEPTED');

      var requestHeaders = {
        'If-Match': 'etag',
        Prefer: 'return=representation',
        'Content-Type': 'application/calendar+json',
        Accept: 'application/json, text/plain, */*'
      };

      var conflictHeaders = {
        ETag: 'conflict'
      };

      var successRequestHeaders = {
        'If-Match': 'conflict',
        Prefer: 'return=representation',
        'Content-Type': 'application/calendar+json',
        Accept: 'application/json, text/plain, */*'
      };
      var successHeaders = {
        ETag: 'success'
      };

      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics', copy.toJSON(), requestHeaders).respond(412, self.vcalendar.toJSON(), conflictHeaders);
      self.$httpBackend.expectGET('/dav/api/path/to/uid.ics').respond(200, self.vcalendar.toJSON(), conflictHeaders);
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics', copy.toJSON(), successRequestHeaders).respond(200, self.vcalendar.toJSON(), successHeaders);

      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'ACCEPTED', 'etag').then(
        function(shell) {
          expect(shell.etag).to.equal('success');
          done();
        }, unexpected.bind(null, done)
      );

      self.$httpBackend.flush();
    });

    it('should change the participation status if the event is recurrent', function(done) {
      var recurrentCalendarShell = new self.CalendarShell(new ICAL.Component(ICAL.parse(__FIXTURES__['src/linagora.esn.calendar/app/fixtures/calendar/reventWithTz.ics'])), { path: '/path/to/uid.ics' });

      recurrentCalendarShell.attendees = [{ email: 'test@example.com' }];
      var copy = new self.CalendarShell(new ICAL.Component(ICAL.helpers.clone(recurrentCalendarShell.vcalendar.toJSON(), true)));

      var instance = recurrentCalendarShell.expand()[0];

      var emails = ['test@example.com'];
      var vevent = copy.vcalendar.getAllSubcomponents('vevent').filter(function(vevent) {
        return vevent.getFirstProperty('recurrence-id');
      })[0];

      vevent.removeAllProperties('attendee');

      var att = vevent.addPropertyWithValue('attendee', 'mailto:test@example.com');

      att.setParameter('partstat', 'ACCEPTED');
      att.setParameter('rsvp', 'TRUE');
      att.setParameter('role', 'REQ-PARTICIPANT');
      att.setParameter('cutype', 'INDIVIDUAL');

      self.$httpBackend.expectGET(/^\/dav\/api\/path\/to\/uid.ics/).respond(200, JSON.stringify(recurrentCalendarShell.vcalendar.jCal));

      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics', function(jCal) {
        var shell = new self.CalendarShell(new ICAL.Component(JSON.parse(jCal)));

        return copy.vcalendar.toString() === shell.vcalendar.toString();
      }).respond(200, new ICAL.Component('vcalendar').jCal);

      self.calEventService.changeParticipation('/path/to/uid.ics', instance, emails, 'ACCEPTED').then(
        function(response) {
          expect(response).to.exist;
          done();
        }, unexpected.bind(null, done)
      );

      self.$httpBackend.flush();
    });

    it('should fail for unhandle status code', function() {
      var emails = ['test@example.com'];
      var errorSpy = sinon.spy();

      var vevent = self.event.vevent;
      var att = vevent.addPropertyWithValue('attendee', 'mailto:test@example.com');

      att.setParameter('partstat', 'ACCEPTED');
      att.setParameter('rsvp', 'TRUE');
      att.setParameter('role', 'REQ-PARTICIPANT');

      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'DECLINED').catch(errorSpy);
      self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics', _.constant(true)).respond(201, {});
      self.$httpBackend.flush();

      expect(errorSpy).to.have.been.calledOnce;
    });

    it('should call the event setOrganizerPartStat function when the organizer is trying to change his status', function() {
      const emails = ['organize@example.com'];
      const promiseSpy = sinon.spy();

      self.calEventAPI.changeParticipation = sinon.stub().returns($q.when({}));
      self.event.setOrganizerPartStat = sinon.spy();
      self.event.changeParticipation = sinon.spy();
      self.event.organizer = { email: 'organize@example.com' };
      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'DECLINED').then(promiseSpy);
      self.$rootScope.$apply();

      expect(self.event.setOrganizerPartStat).to.have.been.called;
      expect(self.event.changeParticipation).to.not.have.been.called;
      expect(self.calEventAPI.changeParticipation).to.have.been.called;
    });

    it('should not call the event setOrganizerPartStat function when a non organizer is trying to change his status', function() {
      const emails = ['somethingelse@example.com'];
      const promiseSpy = sinon.spy();

      self.calEventAPI.changeParticipation = sinon.stub().returns($q.when({}));
      self.event.setOrganizerPartStat = sinon.spy();
      self.event.changeParticipation = sinon.spy();
      self.event.organizer = { email: 'organize@example.com' };
      self.calEventService.changeParticipation('/path/to/uid.ics', self.event, emails, 'DECLINED').then(promiseSpy);
      self.$rootScope.$apply();

      expect(self.event.setOrganizerPartStat).to.not.have.been.called;
      expect(self.event.changeParticipation).to.have.been.called;
    });

    // Everything else is covered by the modify fn
  });

  describe('The getEventByUID fn', function() {

    it('should get a non-recurring event', function(done) {
      this.$httpBackend.expect('REPORT', '/dav/api/calendars/myHome.json', { uid: 'myUid' }).respond({
        _links: {
          self: { href: '/prepath/path/to/calendar.json' }
        },
        _embedded: {
          'dav:item': [{
            _links: {
              self: { href: '/prepath/path/to/calendar/myuid.ics' }
            },
            etag: '"123123"',
            data: [
              'vcalendar', [], [
                ['vevent', [
                  ['uid', {}, 'text', 'myuid'],
                  ['summary', {}, 'text', 'title'],
                  ['location', {}, 'text', 'location'],
                  ['dtstart', {}, 'date-time', '2014-01-01T02:03:04'],
                  ['dtend', {}, 'date-time', '2014-01-01T03:03:04']
                ], []]
              ]
            ]
          }]
        }
      });

      self.calEventService.getEventByUID('myHome', 'myUid').then(function(event) {
        expect(event.uid).to.equal('myuid');
        expect(event.title).to.equal('title');
        expect(event.location).to.equal('location');
        expect(event.start.toDate()).to.equalDate(self.calMoment('2014-01-01 02:03:04').toDate());
        expect(event.end.toDate()).to.equalDate(self.calMoment('2014-01-01 03:03:04').toDate());
        expect(event.vcalendar).to.be.an('object');
        expect(event.etag).to.equal('"123123"');
        expect(event.path).to.equal('/prepath/path/to/calendar/myuid.ics');

        done();
      });

      self.$httpBackend.flush();
    });

    it('should get a recurring event', function(done) {
      this.$httpBackend.expect('REPORT', '/dav/api/calendars/myHome.json', { uid: 'myUid' }).respond({
        _links: {
          self: { href: '/prepath/path/to/calendar.json' }
        },
        _embedded: {
          'dav:item': [{
            _links: {
              self: { href: '/prepath/path/to/calendar/myuid.ics' }
            },
            etag: '"123123"',
            data: [
              'vcalendar', [], [
                ['vevent', [
                  ['uid', {}, 'text', 'myuid'],
                  ['summary', {}, 'text', 'title'],
                  ['location', {}, 'text', 'location'],
                  ['dtstart', {}, 'date-time', '2014-01-01T02:03:04'],
                  ['dtend', {}, 'date-time', '2014-01-01T03:03:04'],
                  ['recurrence-id', {}, 'date-time', '2014-01-01T02:03:04']
                ], []],
                ['vevent', [
                  ['uid', {}, 'text', 'myuid'],
                  ['summary', {}, 'text', 'title'],
                  ['location', {}, 'text', 'location'],
                  ['dtstart', {}, 'date-time', '2014-01-02T02:03:04'],
                  ['dtend', {}, 'date-time', '2014-01-02T03:03:04'],
                  ['recurrence-id', {}, 'date-time', '2014-01-02T02:03:04']
                ], []]
              ]
            ]
          }]
        }
      });

      self.calEventService.getEventByUID('myHome', 'myUid').then(function(event) {
        expect(event.uid).to.equal('myuid');
        expect(event.title).to.equal('title');
        expect(event.location).to.equal('location');
        expect(event.start.toDate()).to.equalDate(self.calMoment('2014-01-01 02:03:04').toDate());
        expect(event.end.toDate()).to.equalDate(self.calMoment('2014-01-01 03:03:04').toDate());
        expect(event.vcalendar).to.be.an('object');
        expect(event.etag).to.equal('"123123"');
        expect(event.path).to.equal('/prepath/path/to/calendar/myuid.ics');

        expect(event.vcalendar.getAllSubcomponents('vevent')).to.have.length(2);

        done();
      });

      self.$httpBackend.flush();
    });

  });

  describe('graceperiod is deactivated', function() {

    beforeEach(function() {
      self.CAL_GRACE_DELAY_IS_ACTIVE_MOCK = false;
    });

    describe('createEvent', function() {
      var calendar, event, vcalendar, vevent;

      beforeEach(function() {
        calendar = {
          calendarHomeId: calendarHomeId,
          id: calendarId,
          isSubscription: function() {
            return false;
          }
        };

        vcalendar = new ICAL.Component('vcalendar');
        vevent = new ICAL.Component('vevent');

        vevent.addPropertyWithValue('uid', eventUUID);
        vevent.addPropertyWithValue('dtstart', dtstart);
        vcalendar.addSubcomponent(vevent);
        event = new self.CalendarShell(vcalendar);

        sinon.spy(self.gracePeriodService, 'grace');

        self.$httpBackend.expectPUT(getEventPath()).respond(201, { id: '123456789' });
      });

      it('should display a notification when the request to create an event is being processed and close it when the request succeeds', function(done) {
        const vcalendar = new ICAL.Component('vcalendar');
        const vevent = new ICAL.Component('vevent');

        vevent.addPropertyWithValue('uid', eventUUID);
        vevent.addPropertyWithValue('dtstart', dtstart);
        vevent.addPropertyWithValue('dtend', dtend);
        vevent.addPropertyWithValue('summary', 'test event');
        vcalendar.addSubcomponent(vevent);

        const path = getEventPath();
        const etag = 'ETAG';
        const calendarShell = new self.CalendarShell(vcalendar, {
          path: path,
          etag: etag
        });

        self.calEventAPI.create = () => $q.resolve();

        self.calEventService.createEvent(calendar, calendarShell)
          .then(() => {
            expect(self.closeNotificationMock).to.have.been.calledOnce;
            done();
          })
          .catch(err => done(err || new Error('should resolve')));

        expect(self.notificationFactoryMock.strongInfo).to.have.been.calledWith('Event creation', 'Saving event...');
        self.$rootScope.$digest();
      });

      it('should display a notification when the request to create an event is being processed and close it when the request fails', function(done) {
        const vcalendar = new ICAL.Component('vcalendar');
        const vevent = new ICAL.Component('vevent');

        vevent.addPropertyWithValue('uid', eventUUID);
        vevent.addPropertyWithValue('dtstart', dtstart);
        vevent.addPropertyWithValue('dtend', dtend);
        vevent.addPropertyWithValue('summary', 'test event');
        vcalendar.addSubcomponent(vevent);

        const path = getEventPath();
        const etag = 'ETAG';
        const calendarShell = new self.CalendarShell(vcalendar, {
          path: path,
          etag: etag
        });

        self.calEventAPI.create = () => $q.reject(new Error('Request failed'));

        self.calEventService.createEvent(calendar, calendarShell)
          .then(() => done(new Error('should not resolve')))
          .catch(err => {
            expect(err).to.exist;
            expect(self.closeNotificationMock).to.have.been.calledOnce;
            done();
          });

        expect(self.notificationFactoryMock.strongInfo).to.have.been.calledWith('Event creation', 'Saving event...');
        self.$rootScope.$digest();
      });

      it('should not call calCachedEventSource.registerAdd', function() {
        self.calEventService.createEvent(calendar, event, {});

        self.$httpBackend.flush();

        expect(calCachedEventSourceMock.registerAdd).to.not.have.been.called;
      });

      it('should not call calMasterEventCache.save', function() {
        self.calEventService.createEvent(calendar, event, { graceperiod: true });

        self.$httpBackend.flush();

        expect(self.calMasterEventCache.save).to.not.have.been.called;
      });

      it('should not call calendarEventEmitterMock.emitCreatedEvent', function() {
        self.calEventService.createEvent(calendar, event, { graceperiod: true });

        self.$httpBackend.flush();

        expect(self.calendarEventEmitterMock.emitCreatedEvent).to.not.have.been.called;
      });

      it('should call notificationFactory.weakSuccess', function() {
        self.calEventService.createEvent(calendar, event, { graceperiod: true });

        self.$httpBackend.flush();

        expect(self.notificationFactoryMock.weakSuccess).to.have.been.calledWith('createEvent', self.esnI18nService.translate('Event created'));
      });

      it('should not call gracePeriodService.grace', function() {
        self.calEventService.createEvent(calendar, event, { graceperiod: true });

        self.$httpBackend.flush();

        expect(self.gracePeriodService.grace).to.not.have.been.called;
      });
    });

    describe('removeEvent', function() {
      var event;

      beforeEach(function() {
        event = {
          id: eventUUID,
          title: 'test event',
          start: self.calMoment(),
          end: self.calMoment(),
          isInstance: _.constant(false)
        };

        sinon.spy(self.gracePeriodService, 'grace');

        self.$httpBackend.expectDELETE('/dav/api/path/to/00000000-0000-4000-a000-000000000000.ics').respond(204, { id: '123456789' });
      });

      it('should display a notification when the request to remove the event is being processed and close it when the request succeeds', function(done) {
        self.calEventAPI.remove = () => $q.resolve();

        self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag')
          .then(() => {
            expect(self.closeNotificationMock).to.have.been.calledOnce;
            done();
          })
          .catch(err => done(err || new Error('should resolve')));

        expect(self.notificationFactoryMock.strongInfo).to.have.been.calledWith('Event removal', 'Removing event...');
        self.$rootScope.$digest();
      });

      it('should display a notification when the request to remove the event is being processed and close it when the request fails', function(done) {
        self.calEventAPI.remove = () => $q.reject(new Error('Request failed'));

        self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag')
          .then(() => done(new Error('should not resolve')))
          .catch(err => {
            expect(err).to.exist;
            expect(self.closeNotificationMock).to.have.been.calledOnce;
            done();
          });

        expect(self.notificationFactoryMock.strongInfo).to.have.been.calledWith('Event removal', 'Removing event...');
        self.$rootScope.$digest();
      });

      it('should not call calCachedEventSource.registerDelete', function() {
        self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag');

        self.$httpBackend.flush();

        expect(calCachedEventSourceMock.registerDelete).to.not.have.been.called;
      });

      it('should not call calendarEventEmitter.emitRemovedEvent', function() {
        self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag');

        self.$httpBackend.flush();

        expect(self.calendarEventEmitterMock.emitRemovedEvent).to.not.have.been.called;
      });

      it('should not call gracePeriodService.grace', function() {
        self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag');

        self.$httpBackend.flush();

        expect(self.gracePeriodService.grace).to.not.have.been.called;
      });

      it('should call notificationFactory.weakSuccess', function() {
        self.calEventService.removeEvent('/path/to/00000000-0000-4000-a000-000000000000.ics', event, 'etag');

        self.$httpBackend.flush();

        expect(self.notificationFactoryMock.weakSuccess).to.have.been.calledWith('performRemove', self.esnI18nService.translate('Event removed'));
      });
    });

    describe('modifyEvent', function() {
      var event;

      beforeEach(function() {
        var attendees = [
          { emails: ['user1@lng.com'], partstat: 'ACCEPTED' },
          { emails: ['user2@lng.com'], partstat: 'NEEDS-ACTION' }
        ];

        var vcalendar = new ICAL.Component('vcalendar');
        var vevent = new ICAL.Component('vevent');

        vevent.addPropertyWithValue('uid', eventUUID);
        vevent.addPropertyWithValue('summary', 'test event');
        vevent.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(new Date())).setParameter('tzid', 'Europe/Paris');
        vevent.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(new Date())).setParameter('tzid', 'Europe/Paris');
        vevent.addPropertyWithValue('transp', 'OPAQUE');
        attendees.forEach(function(attendee) {
          var mailto = 'mailto:' + attendee.emails[0];
          var property = vevent.addPropertyWithValue('attendee', mailto);

          property.setParameter('partstat', attendee.partstat);
          property.setParameter('rsvp', 'TRUE');
          property.setParameter('role', 'REQ-PARTICIPANT');
        });
        vcalendar.addSubcomponent(vevent);

        event = new self.CalendarShell(vcalendar, {
          path: '/path/to/uid.ics'
        });

        self.oldEvent = event.clone();
        self.oldEvent.start = event.start.clone().add(1, 'hour');

        sinon.spy(self.gracePeriodService, 'grace');

        self.$httpBackend.expectPUT('/dav/api/path/to/uid.ics').respond(204, { id: '123456789' });
      });

      it('should display a notification while the request to modify the event is being processed and close it when the request succeeds', function(done) {
        self.calEventAPI.modify = () => $q.when();

        self.calEventService.modifyEvent('/path/to/uid.ics', event, event, 'etag', angular.noop)
          .then(() => {
            expect(self.closeNotificationMock).to.have.been.calledOnce;
            done();
          })
          .catch(err => done(err || new Error('should resolve')));

        expect(self.notificationFactoryMock.strongInfo).to.have.been.calledWith('Event modification', 'Saving event...');
        self.$rootScope.$digest();
      });

      it('should display a notification while the request to modify the event is being processed and close it when the request fails', function(done) {
        self.calEventAPI.modify = () => $q.reject(new Error('Request failed'));

        self.calEventService.modifyEvent('/path/to/uid.ics', event, event, 'etag', angular.noop)
          .then(() => done(new Error('should not resolve')))
          .catch(err => {
            expect(err).to.exist;
            expect(self.closeNotificationMock).to.have.been.calledOnce;
            done();
          });

        expect(self.notificationFactoryMock.strongInfo).to.have.been.calledWith('Event modification', 'Saving event...');
        self.$rootScope.$digest();
      });

      it('should not call calendarEventEmitterMock.emitModifiedEvent', function() {
        self.calEventService.modifyEvent('/path/to/uid.ics', event, event, 'etag', angular.noop, { notifyFullcalendar: true });

        self.$httpBackend.flush();

        expect(self.calendarEventEmitterMock.emitModifiedEvent).to.not.have.been.called;
      });

      it('should not call calCachedEventSource.registerUpdate', function() {
        self.calEventService.modifyEvent('/path/to/uid.ics', event, event, 'etag', angular.noop, { notifyFullcalendar: true });

        self.$httpBackend.flush();

        expect(calCachedEventSourceMock.registerUpdate).to.not.have.been.called;
      });

      it('should not call gracePeriodService.grace', function() {
        self.calEventService.modifyEvent('/path/to/uid.ics', event, event, 'etag', angular.noop, { notifyFullcalendar: true });

        self.$httpBackend.flush();

        expect(self.gracePeriodService.grace).to.not.have.been.called;
      });

      it('should call notificationFactoryMock.weakSuccess', function() {
        self.calEventService.modifyEvent('/path/to/uid.ics', event, event, 'etag', angular.noop, { notifyFullcalendar: true });

        self.$httpBackend.flush();

        expect(self.notificationFactoryMock.weakSuccess).to.have.been.calledWith('modifyEvent', self.esnI18nService.translate('Event updated'));
      });
    });
  });

  describe('The sendCounter fn', function() {
    beforeEach(function() {
      sinon.spy(self.calEventAPI, 'sendCounter');
    });

    it('should return undefined if suggested event is undefined', function(done) {
      self.calEventService.sendCounter().then(function(response) {
        expect(response).to.be.undefined;

        done();
      }).catch(done);

      self.$rootScope.$digest();
    });

    it('should return undefined if suggested event is incomplete', function(done) {
      var fakeEvent = new self.CalendarShell(new ICAL.Component(ICAL.parse(__FIXTURES__['src/linagora.esn.calendar/app/fixtures/calendar/event.ics'])), { path: '/path/to/uid.ics' });

      delete fakeEvent.vcalendar;

      self.calEventService.sendCounter(fakeEvent).then(function(response) {
        expect(response).to.be.undefined;

        done();
      }).catch(done);

      self.$rootScope.$digest();
    });

    it('should call calEventAPI with correct event path', function(done) {
      var fakePath = '/path/to/uid.ics';
      var fakeEvent = new self.CalendarShell(new ICAL.Component(ICAL.parse(__FIXTURES__['src/linagora.esn.calendar/app/fixtures/calendar/recurringEventWithTwoExceptions.ics'])), { path: fakePath });

      this.$httpBackend.expect('POST', '/dav/api' + fakePath).respond(200, 'aResponse');

      self.calEventService.sendCounter(fakeEvent).then(function() {
        expect(self.calEventAPI.sendCounter).to.have.been.calledWith(fakePath);

        done();
      }).catch(done);

      self.$httpBackend.flush();
    });

    it('should call calEventAPI with a correctly formatted request body', function(done) {
      var fakePath = '/path/to/uid.ics';
      var icalRequestParsed = ICAL.parse(__FIXTURES__['src/linagora.esn.calendar/app/fixtures/calendar/eventRequestRegular.ics']);
      var eventRequest = new self.CalendarShell(new ICAL.Component(icalRequestParsed), { path: fakePath });

      var expectedCounter = new self.CalendarShell(new ICAL.Component(JSON.parse(__FIXTURES__['src/linagora.esn.calendar/app/fixtures/calendar/counter_test/counter.json'])));
      var expectedBody = {
        ical: expectedCounter.vcalendar.toString(),
        sender: undefined,
        recipient: 'a@example.com',
        uid: 'calsrv.example.com-873970198738777a@example.com',
        sequence: 0,
        method: 'COUNTER'
      };

      this.$httpBackend.expect('POST', '/dav/api' + fakePath).respond(200, 'aResponse');

      self.calEventService.sendCounter(eventRequest).then(function() {
        expect(self.calEventAPI.sendCounter).to.have.been.calledWith(eventRequest.path, expectedBody);

        done();
      }).catch(done);

      self.$httpBackend.flush();
    });

  });

  describe('The searchEvents fn', function() {
    var searchOptions = {
      calendars: [
        { id: 'userId1', calendarHomeId: 'userId1' }
      ],
      query: {
        advanced: {
          contains: 'king'
        }
      },
      offset: 0,
      limit: 30
    };

    it('should return an empty array when no calendars are provided in the search options', function(done) {
      self.calEventService.searchEvents({ calendars: [] }).then(function(results) {
        expect(results).to.be.empty;
        done();
      }).catch(function(err) {
        done(err || new Error('should not happen'));
      });

      self.$rootScope.$digest();
    });

    it('should call #calendarAPI.searchEvents with good parameters and return an array of events when it succeeds', function(done) {
      var mockEvents = [{
        _links: {
          self: {
            href: '/prepath/path/to/calendar/event1.ics'
          }
        },
        data: {
          some: 'thing'
        }
      }];

      sinon.stub(self.calendarAPI, 'searchEvents', function(options) {
        expect(options).to.deep.equal(searchOptions);

        return $q.resolve(mockEvents);
      });

      self.calEventService.searchEvents(searchOptions).then(function(events) {
        events.forEach(function(event, index) {
          expect(event).to.shallowDeepEqual(mockEvents[index].data);
        });

        done();
      }).catch(function(err) {
        done(err || new Error('should not happen'));
      });

      self.$rootScope.$digest();
    });

    it('should call #calendarAPI.searchEvents with good parameters and fail if it fails', function(done) {
      sinon.stub(self.calendarAPI, 'searchEvents', function(options) {
        expect(options).to.deep.equal(searchOptions);

        return $q.reject(new Error('it is going to fail'));
      });

      self.calEventService.searchEvents(searchOptions)
        .then(function() {
          done(new Error('should not happen'));
        })
        .catch(function(err) {
          expect(err).to.exist;
          done();
        });

      self.$rootScope.$digest();
    });
  });
});
