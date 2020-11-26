'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calDavRequest factory', function() {
  var $httpBackend, calDavRequest, event;
  let tokenAPIMock, calCalDAVURLServiceMock, CAL_DAV_PATH;

  describe('with graceperiod activated', function() {
    beforeEach(function() {
      tokenAPIMock = {
        getNewToken: function() {
          return $q.when({ data: { token: '123' } });
        }
      };

      calCalDAVURLServiceMock = {
        getFrontendURL() {
          return $q.when('');
        }
      };

      angular.mock.module('esn.calendar.libs', function($provide) {
        $provide.constant('CAL_GRACE_DELAY_IS_ACTIVE', true);
        $provide.value('tokenAPI', tokenAPIMock);
        $provide.value('calCalDAVURLService', calCalDAVURLServiceMock);
      });

      angular.mock.inject(function(_calDavRequest_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        calDavRequest = _calDavRequest_;
      });

      event = { id: 'eventId' };
    });

    it('should perform a call to the given path on the DAV server', function(done) {
      $httpBackend.expectGET('/calendars/test/events.json').respond(event);

      calDavRequest('get', '/calendars/test/events.json').then(function(response) {
        expect(response.data).to.deep.equal(event);
        done();
      }, done);

      $httpBackend.flush();
    });
  });

  describe('with graceperiod deactivated', function() {
    beforeEach(function() {
      tokenAPIMock = {
        getNewToken: function() {
          return $q.when({ data: { token: '123' } });
        }
      };

      calCalDAVURLServiceMock = {
        getFrontendURL() {
          return $q.when('');
        }
      };

      angular.mock.module('esn.calendar.libs', function($provide) {
        $provide.constant('CAL_GRACE_DELAY_IS_ACTIVE', false);
        $provide.value('tokenAPI', tokenAPIMock);
        $provide.value('calCalDAVURLService', calCalDAVURLServiceMock);
      });

      angular.mock.inject(function(_calDavRequest_, _$httpBackend_, _CAL_DAV_PATH_) {
        $httpBackend = _$httpBackend_;
        calDavRequest = _calDavRequest_;
        CAL_DAV_PATH = _CAL_DAV_PATH_;
      });

      event = { id: 'eventId' };
    });

    it('should remove the graceperiod param', function(done) {
      $httpBackend.expectGET(`${CAL_DAV_PATH}/calendars/test/events.json`).respond(event);

      calDavRequest('get', '/calendars/test/events.json', null, null, { graceperiod: true }).then(function(response) {
        expect(response.data).to.deep.equal(event);
        done();
      }, done);

      $httpBackend.flush();
    });
  });
});
