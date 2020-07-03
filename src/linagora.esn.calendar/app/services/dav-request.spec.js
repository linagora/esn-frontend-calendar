'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calDavRequest factory', function() {
  var $httpBackend, calDavRequest, event;

  describe('with graceperiod activated', function() {
    beforeEach(function() {
      angular.mock.module('esn.calendar', function($provide) {
        $provide.constant('CAL_GRACE_DELAY_IS_ACTIVE', true);
      });

      angular.mock.inject(function(_calDavRequest_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        calDavRequest = _calDavRequest_;
      });

      event = { id: 'eventId' };
    });

    it('should perform a call to the given path on the DAV proxy', function(done) {
      $httpBackend.expectGET('/dav/api/calendars/test/events.json').respond(event);

      calDavRequest('get', '/calendars/test/events.json').then(function(response) {
        expect(response.data).to.deep.equal(event);
        done();
      }, done);

      $httpBackend.flush();
    });

    it('should perform a call to the DAV proxy even if the given path contains another base URL', function(done) {
      $httpBackend.expectGET('/dav/api/calendars/test/events.json').respond(event);

      calDavRequest('get', 'caldav/server/base/URL/calendars/test/events.json').then(function(response) {
        expect(response.data).to.deep.equal(event);
        done();
      }, done);

      $httpBackend.flush();
    });

    it('should keep the graceperiod param', function(done) {
      $httpBackend.expectGET('/dav/api/calendars/test/events.json?graceperiod=true').respond(event);

      calDavRequest('get', '/calendars/test/events.json', null, null, { graceperiod: true }).then(function(response) {
        expect(response.data).to.deep.equal(event);
        done();
      }, done);

      $httpBackend.flush();
    });
  });

  describe('with graceperiod deactivated', function() {
    beforeEach(function() {
      angular.mock.module('esn.calendar', function($provide) {
        $provide.constant('CAL_GRACE_DELAY_IS_ACTIVE', false);
      });

      angular.mock.inject(function(_calDavRequest_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        calDavRequest = _calDavRequest_;
      });
      event = { id: 'eventId' };
    });

    it('should remove the graceperiod param', function(done) {
      $httpBackend.expectGET('/dav/api/calendars/test/events.json').respond(event);

      calDavRequest('get', '/calendars/test/events.json', null, null, { graceperiod: true }).then(function(response) {
        expect(response.data).to.deep.equal(event);
        done();
      }, done);

      $httpBackend.flush();
    });
  });
});
