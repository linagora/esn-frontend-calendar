'use strict';

describe('The calCalendarSubscriptionApiService factory', function() {

  var calendarHomeId, subscriptionId, subscription;
  let tokenAPIMock, calCalDAVURLServiceMock;

  beforeEach(function() {
    tokenAPIMock = {
      getWebToken() {
        return $q.when({ data: 'jwt' });
      }
    };

    calCalDAVURLServiceMock = {
      getFrontendURL() {
        return $q.when('/dav/api');
      }
    };

    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs', function($provide) {
      $provide.value('Cache', function() {});
      $provide.value('tokenAPI', tokenAPIMock);
      $provide.value('calCalDAVURLService', calCalDAVURLServiceMock);
    });

    calendarHomeId = '123';
    subscriptionId = '456';
    subscription = {
      id: 1,
      _links: {
        self: { href: '/prepath/path/to/calendar.json' }
      }
    };

    angular.mock.inject(function($httpBackend, calCalendarSubscriptionApiService, CalendarCollectionShell, CALENDAR_CONTENT_TYPE_HEADER) {
      this.$httpBackend = $httpBackend;
      this.calCalendarSubscriptionApiService = calCalendarSubscriptionApiService;
      this.CALENDAR_CONTENT_TYPE_HEADER = CALENDAR_CONTENT_TYPE_HEADER;
      this.CalendarCollectionShell = CalendarCollectionShell;
    });

    this.getSubscriptionPath = function() {
      return '/dav/api/calendars/' + calendarHomeId + '/' + subscriptionId + '.json';
    };

    this.getSubscriptionsPath = function() {
      return '/dav/api/calendars/' + calendarHomeId + '.json';
    };
  });

  describe('The get function', function() {
    it('should call the right caldav endpoint', function(done) {
      this.$httpBackend.expect('GET', this.getSubscriptionPath()).respond(200);
      this.calCalendarSubscriptionApiService.get(calendarHomeId, subscriptionId)
        .then(function() {
          done();
        }, done);
      this.$httpBackend.flush();
    });
  });

  describe('The subscribe function', function() {
    it('should call the right caldav endpoint', function(done) {
      var shell = new this.CalendarCollectionShell(subscription);

      this.$httpBackend.expect('POST', this.getSubscriptionsPath()).respond(201);
      this.calCalendarSubscriptionApiService.subscribe(calendarHomeId, shell)
        .then(function() {
          done();
        }, done);
      this.$httpBackend.flush();
    });
  });

  describe('The unsubscribe function', function() {
    it('should call the right caldav endpoint', function(done) {
      this.$httpBackend.expect('DELETE', this.getSubscriptionPath()).respond(204);
      this.calCalendarSubscriptionApiService.unsubscribe(calendarHomeId, subscriptionId)
        .then(function() {
          done();
        }, done);
      this.$httpBackend.flush();
    });
  });

  describe('The update function', function() {
    it('should call the right caldav endpoint', function(done) {
      var shell = new this.CalendarCollectionShell(subscription);

      this.$httpBackend.expect('PROPPATCH', this.getSubscriptionPath()).respond(204);
      this.calCalendarSubscriptionApiService.update(calendarHomeId, subscriptionId, shell)
        .then(function() {
          done();
        }, done);
      this.$httpBackend.flush();
    });
  });
});
