'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calFreebusyAPI service', function() {
  var davItem, davItems, notificationFactoryMock;

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
      data: davItems
    };
  }

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.value('notificationFactory', notificationFactoryMock);
    });

    angular.mock.inject(function($httpBackend, calMoment, calFreebusyAPI) {
      this.$httpBackend = $httpBackend;
      this.calMoment = calMoment;
      this.calFreebusyAPI = calFreebusyAPI;
    });

    var davDateFormat = 'YYYYMMDD[T]HHmmss';

    this.start = this.calMoment('2014-01-01');
    this.end = this.calMoment('2014-01-02');
    this.data = {
      type: 'free-busy-query',
      match: {
        start: this.start.format(davDateFormat),
        end: this.end.format(davDateFormat)
      }
    };

    this.vcalendar = {
      id: 'id'
    };

    davItem = {
      _links: {
        self: {href: '/dav/api/calendars/test/events.json'}
      },
      etag: '"123123"',
      data: [
        'vcalendar', [], [
          ['vfreebusy', [], []]
        ]
      ]
    };

    davItems = [davItem];
  });

  describe('The report function', function() {
    it('should request the correct path and return an array of items included in data', function(done) {
      this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond(davItemsResponse(davItems));

      this.calFreebusyAPI.report('/dav/api/calendars/test/events.json', this.start, this.end)
        .then(function(data) {
          expect(data).to.deep.equal(davItems);
          done();
        });

      this.$httpBackend.flush();
    });

    it('should return an empty array if response.data is not defined', function(done) {
      this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond(null);
      this.calFreebusyAPI.report('/dav/api/calendars/test/events.json', this.start, this.end)
        .then(function(data) {
          expect(data).to.deep.equal([]);
          done();
        });

      this.$httpBackend.flush();
    });

    it('should return an empty array if response.data.data is not defined', function(done) {
      this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond({
        _links: {
          self: { href: '/dav/api/calendars/test/events.json' }
        },
        data: null
      });

      this.calFreebusyAPI.report('/dav/api/calendars/test/events.json', this.start, this.end)
        .then(function(data) {
          expect(data).to.deep.equal([]);
          done();
        });
      this.$httpBackend.flush();
    });

    it('should return an Error if response.status is not 200', function(done) {
      this.$httpBackend.expect('REPORT', '/dav/api/calendars/test/events.json', this.data, headerContentTypeJsonChecker).respond(500, 'Error');
      this.calFreebusyAPI.report('/dav/api/calendars/test/events.json', this.start, this.end)
        .catch(function(err) {
          expect(err).to.exist;
          done();
        });
      this.$httpBackend.flush();
    });
  });

  describe('The getBulkFreebusyStatus function', function() {
    var bulkRequest, users, freeBusyEndpoint, davDateFormat;

    beforeEach(function() {
      freeBusyEndpoint = '/dav/api/calendars/freebusy';
      davDateFormat = 'YYYYMMDD[T]HHmmss';
      users = [1, 2];
      bulkRequest = {
        start: this.start.format(davDateFormat),
        end: this.end.format(davDateFormat),
        users: users,
        uids: []
      };
    });

    it('should request the correct endpoint', function(done) {
      var result = {
        users: {1: {}, 2: {}}
      };

      this.$httpBackend.expect('POST', freeBusyEndpoint, bulkRequest, headerContentTypeJsonChecker).respond(result);

      this.calFreebusyAPI.getBulkFreebusyStatus(users, this.start, this.end)
        .then(function(data) {
          expect(data).to.deep.equal(result);
          done();
        })
        .catch(done);

      this.$httpBackend.flush();
    });

    it('should return an empty hash if response.data is not defined', function(done) {
      this.$httpBackend.expect('POST', freeBusyEndpoint, bulkRequest, headerContentTypeJsonChecker).respond(null);

      this.calFreebusyAPI.getBulkFreebusyStatus(users, this.start, this.end)
        .then(function(data) {
          expect(data).to.deep.equal({});
          done();
        })
        .catch(done);

      this.$httpBackend.flush();
    });

    it('should return an Error if response.status is not 200', function(done) {
      this.$httpBackend.expect('POST', freeBusyEndpoint, bulkRequest, headerContentTypeJsonChecker).respond(500, 'Error');

      this.calFreebusyAPI.getBulkFreebusyStatus(users, this.start, this.end)
        .then(function() {
          done(new Error('Should not occur'));
        })
        .catch(function(err) {
          expect(err).to.exist;
          done();
        });

      this.$httpBackend.flush();
    });
  });
});
