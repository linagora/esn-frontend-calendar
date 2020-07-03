'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calendar module apis', function() {

  var davItem, davItemRecurring, davItems, davItemsRecurring, notificationFactoryMock;

  notificationFactoryMock = {
    weakInfo: sinon.spy(),
    weakError: sinon.spy()
  };

  function headerContentTypeJsonChecker(header) {
    return header['Content-Type'] === 'application/json';
  }

  function davItemsResponse(davItems) {
    return {
      _links: {
        self: { href: '/prepath/path/to/calendar.json' }
      },
      _embedded: {
        'dav:item': davItems
      }
    };
  }

  beforeEach(function() {
    module('esn.calendar');

    module(function($provide) {
      $provide.value('notificationFactory', notificationFactoryMock);
    });

    inject(function($httpBackend, calendarRestangular, calMoment, calendarAPI, calEventAPI, CALENDAR_CONTENT_TYPE_HEADER, CAL_ACCEPT_HEADER, CAL_GRACE_DELAY, _ELEMENTS_PER_REQUEST_) {
      this.$httpBackend = $httpBackend;
      this.calendarRestangular = calendarRestangular;
      this.calMoment = calMoment;
      this.calendarAPI = calendarAPI;
      this.calEventAPI = calEventAPI;
      this.CALENDAR_CONTENT_TYPE_HEADER = CALENDAR_CONTENT_TYPE_HEADER;
      this.CAL_ACCEPT_HEADER = CAL_ACCEPT_HEADER;
      this.CAL_GRACE_DELAY = CAL_GRACE_DELAY;
      this.ELEMENTS_PER_REQUEST = _ELEMENTS_PER_REQUEST_;
    });

    var davDateFormat = 'YYYYMMDD[T]HHmmss';

    this.start = this.calMoment('2014-01-01');
    this.end = this.calMoment('2014-01-02');
    this.data = {
      match: {start: this.start.format(davDateFormat), end: this.end.format(davDateFormat)}
    };

    this.vcalendar = {
      id: 'id'
    };

    davItem = {
      _links: {
        self: {href: '/prepath/path/to/calendar/myuid.ics'}
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
    };
    davItemRecurring = {
      _links: {
        self: {href: '/prepath/path/to/calendar/myuid.ics'}
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
    };
    davItems = [davItem];
    davItemsRecurring = [davItemRecurring];
  });

  describe('calendarAPI', function() {

    describe('listEvents request', function() {

      it('should request the correct path and return an array of items included in dav:item', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond(davItemsResponse(davItems));

        this.calendarAPI.listEvents('/dav/api/calendars/test/events.json', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal(davItems);
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data is not defined', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond(null);
        this.calendarAPI.listEvents('/dav/api/calendars/test/events.json', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data._embedded is not defined', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: null
        });
        this.calendarAPI.listEvents('/dav/api/calendars/test/events.json', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data._embedded[\'dav:item\'] is not defined', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: {
            'dav:item': null
          }
        });

        this.calendarAPI.listEvents('/dav/api/calendars/test/events.json', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond(500, 'Error');
        this.calendarAPI.listEvents('/dav/api/calendars/test/events.json', this.start, this.end)
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });
        this.$httpBackend.flush();
      });
    });

    describe('listEventsForCalendar request', function() {

      it('should request the correct path and return an array of items included in dav:item', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/subtest.json', this.data, headerContentTypeJsonChecker).respond(davItemsResponse(davItems));

        this.calendarAPI.listEventsForCalendar('test', 'subtest', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal(davItems);
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data is not defined', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/subtest.json', this.data, headerContentTypeJsonChecker).respond(null);

        this.calendarAPI.listEventsForCalendar('test', 'subtest', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data._embedded is not defined', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/subtest.json', this.data, headerContentTypeJsonChecker).respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: null
        });
        this.calendarAPI.listEventsForCalendar('test', 'subtest', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data._embedded[\'dav:item\'] is not defined', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/subtest.json', this.data, headerContentTypeJsonChecker).respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: {
            'dav:item': null
          }
        });

        this.calendarAPI.listEventsForCalendar('test', 'subtest', this.start, this.end)
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/subtest.json', this.data, headerContentTypeJsonChecker).respond(500, 'Error');
        this.calendarAPI.listEventsForCalendar('test', 'subtest', this.start, this.end)
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });
        this.$httpBackend.flush();
      });
});

    describe('listCalendars request', function() {
      it('should request the correct path without params and return an array of items included in dav:calendar', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/test.json').respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: {
            'dav:calendar': ['dav:calendar']
          }
        });

        this.calendarAPI.listCalendars('test')
          .then(function(data) {
            expect(data).to.deep.equal(['dav:calendar']);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should request the correct path with params and return an array of items included in dav:calendar', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/test.json?withRights=true').respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: {
            'dav:calendar': ['dav:calendar']
          }
        });

        this.calendarAPI.listCalendars('test', { withRights: true })
          .then(function(data) {
            expect(data).to.deep.equal(['dav:calendar']);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data is not defined', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/test.json').respond(null);

        this.calendarAPI.listCalendars('test')
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data._embedded is not defined', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/test.json').respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: null
        });

        this.calendarAPI.listCalendars('test')
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an empty array if response.data._embedded[\'dav:calendar\'] is not defined', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/test.json').respond({
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          },
          _embedded: {
            'dav:calendar': null
          }
        });

        this.calendarAPI.listCalendars('test')
          .then(function(data) {
            expect(data).to.deep.equal([]);
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/test.json').respond(500, 'Error');

        this.calendarAPI.listCalendars('test')
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });
  });

    describe('getCalendar request', function() {
      it('should request the correct path with params if the options object is defined and return a dav:calendar', function(done) {
        var options = {
          withRights: true
        };

        var davCal = {
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          }
        };

        this.$httpBackend.expectGET('/dav/api/calendars/homeId/id.json?withRights=true').respond(davCal);

        this.calendarAPI.getCalendar('homeId', 'id', options)
          .then(function(data) {
            expect(data).to.deep.equal(davCal);

            done();
          });

        this.$httpBackend.flush();
      });

      it('should request the correct path without params if the options object is undefined and return a dav:calendar', function(done) {
        var davCal = {
          _links: {
            self: { href: '/prepath/path/to/calendar.json' }
          }
        };

        this.$httpBackend.expectGET('/dav/api/calendars/homeId/id.json').respond(davCal);

        this.calendarAPI.getCalendar('homeId', 'id')
          .then(function(data) {
            expect(data).to.deep.equal(davCal);
            done();
          });
        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200', function(done) {
        this.$httpBackend.expectGET('/dav/api/calendars/homeId/id.json').respond(500, 'Error');

        this.calendarAPI.getCalendar('homeId', 'id')
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });
  });

    describe('removeCalendar request', function() {
      it('should return the http response if response.status is 204', function() {
        var thenSpy = sinon.spy();

        this.$httpBackend.expectDELETE('/dav/api/calendars/test/cal.json').respond(204, 'aResponse');
        this.calendarAPI.removeCalendar('test', 'cal').then(thenSpy);
        this.$httpBackend.flush();

        expect(thenSpy).to.have.been.calledWith(sinon.match({data: 'aResponse'}));
      });

      it('should return an Error if response.status is not 204', function() {
        var catchSpy = sinon.spy();

        this.$httpBackend.expectDELETE('/dav/api/calendars/test/cal.json').respond(500, 'error');
        this.calendarAPI.removeCalendar('test', 'cal').catch(catchSpy);
        this.$httpBackend.flush();

        expect(catchSpy).to.have.been.calledWith(sinon.match.truthy);
      });

      it('should return an Error if response.status is not 204', function(done) {

        this.$httpBackend.expectDELETE('/dav/api/calendars/test/cal.json').respond(500, 'error');
        this.calendarAPI.removeCalendar('test', 'cal')
        .catch(function() {
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('Failed to remove calendar', 'Cannot join the server, please try later');

          done();
        });
        this.$httpBackend.flush();
      });
  });
    describe('createCalendar request', function() {

      it('should return the http response if response.status is 201', function(done) {
        this.$httpBackend.expectPOST('/dav/api/calendars/test.json', this.vcalendar).respond(201, 'aResponse');

        this.calendarAPI.createCalendar('test', this.vcalendar)
          .then(function(response) {
            expect(response.data).to.deep.equal('aResponse');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 201', function(done) {
        this.$httpBackend.expectPOST('/dav/api/calendars/test.json', this.vcalendar).respond(500, 'Error');

        this.calendarAPI.createCalendar('test', this.vcalendar)
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });

    it('should return an Error if response.status is not 201', function(done) {
      this.$httpBackend.expectPOST('/dav/api/calendars/test.json', this.vcalendar).respond(500, 'Error');

      this.calendarAPI.createCalendar('test', this.vcalendar)
      .catch(function() {
        expect(notificationFactoryMock.weakError).to.have.been.calledWith('Failed to create calendar', 'Cannot join the server, please try later');

        done();
      });
      this.$httpBackend.flush();
    });
  });

    describe('The getEventByUID fn', function() {

      it('should get a non-recurring event', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/home.json', { uid: 'myuid' }).respond(davItemsResponse(davItems));

        this.calendarAPI.getEventByUID('home', 'myuid').then(function(data) {
          expect(data).to.deep.equal(davItems);

          done();
        });

        this.$httpBackend.flush();
      });

      it('should get a recurring event', function(done) {
        this.$httpBackend.expect('REPORT', '/dav/api/calendars/home.json', {uid: 'myuid'}).respond(davItemsResponse(davItemsRecurring));

        this.calendarAPI.getEventByUID('home', 'myuid').then(function(data) {
          expect(data).to.deep.equal(davItemsRecurring);

          done();
        });

        this.$httpBackend.flush();
      });

    });

    describe('The searchEvents request', function() {
      var eventSearchItems = [{
        _links: {
          self: {href: '/prepath/path/to/calendar/myuid.ics'}
        },
        data: {}
      }];

      var searchResponse = {
        _links: {
          self: { href: '/prepath/path/to/calendar.json' }
        },
        _embedded: {
          events: eventSearchItems
        }
      };

      it('should have a correct request body and return an array of events', function(done) {
        this.$httpBackend.expectPOST('/calendar/api/events/search?limit=' + this.ELEMENTS_PER_REQUEST + '&offset=0').respond(searchResponse);

        this.calendarRestangular.addRequestInterceptor(function(requestBody) {
          expect(requestBody).to.deep.equal({
            calendars: [
              { userId: 'userId0', calendarId: 'userId0' },
              { userId: 'userId0', calendarId: 'calendarId1' },
              { userId: 'userId1', calendarId: 'calendarId2' }
            ],
            query: 'king',
            organizers: ['user0@open-paas.org', 'user1@open-paas.org'],
            attendees: ['user0@open-paas.org']
          });
        });

        this.calendarAPI.searchEvents({
          calendars: [
            { id: 'userId0', calendarHomeId: 'userId0' },
            { id: 'calendarId1', calendarHomeId: 'userId0' },
            {
              id: 'calendarId3', calendarHomeId: 'userId0',
              source: { id: 'calendarId2', calendarHomeId: 'userId1' }
            }
          ],
          query: {
            advanced: {
              contains: 'king',
              organizers: [
                { id: 'userId0', email: 'user0@open-paas.org' },
                { id: 'userId1', email: 'user1@open-paas.org' }
              ],
              attendees: [{ id: 'userId0', email: 'user0@open-paas.org' }]
            }
          },
          offset: 0,
          limit: this.ELEMENTS_PER_REQUEST
        }).then(function(result) {
          expect(result).to.deep.equal(eventSearchItems);

          done();
        }).catch(done);

        this.$httpBackend.flush();
      });

      it('should have a correct request query if there are sortKey and sortOrder', function(done) {
        this.$httpBackend.expectPOST('/calendar/api/events/search?limit=' + this.ELEMENTS_PER_REQUEST + '&offset=0&sortKey=start&sortOrder=asc').respond(searchResponse);

        this.calendarAPI.searchEvents({
          offset: 0,
          limit: this.ELEMENTS_PER_REQUEST,
          sortKey: 'start',
          sortOrder: 'asc',
          calendars: [],
          query: {
            advanced: {}
          }
        }).then(function(result) {
          expect(result).to.deep.equal(eventSearchItems);

          done();
        }).catch(done);

        this.$httpBackend.flush();
      });

      it('should have a correct request body and return an array of events if the search term is in #options.query', function(done) {
        this.$httpBackend.expectPOST('/calendar/api/events/search?limit=' + this.ELEMENTS_PER_REQUEST + '&offset=0').respond(searchResponse);

        this.calendarRestangular.addRequestInterceptor(function(requestBody) {
          expect(requestBody).to.deep.equal({
            calendars: [
              { userId: 'userId0', calendarId: 'userId0' },
              { userId: 'userId0', calendarId: 'calendarId1' },
              { userId: 'userId1', calendarId: 'calendarId2' }
            ],
            query: 'king'
          });
        });

        this.calendarAPI.searchEvents({
          calendars: [
            { id: 'userId0', calendarHomeId: 'userId0' },
            { id: 'calendarId1', calendarHomeId: 'userId0' },
            {
              id: 'calendarId3', calendarHomeId: 'userId0',
              source: { id: 'calendarId2', calendarHomeId: 'userId1' }
            }
          ],
          query: {
            text: 'king'
          },
          offset: 0,
          limit: this.ELEMENTS_PER_REQUEST
        }).then(function(result) {
          expect(result).to.deep.equal(eventSearchItems);

          done();
        }).catch(done);

        this.$httpBackend.flush();
      });
    });
  });

});
