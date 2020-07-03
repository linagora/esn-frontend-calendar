'use strict';

/* global chai */

var expect = chai.expect;

describe('The calendarHomeService service', function() {
  var $rootScope, calendarHomeService, session, userId;

  beforeEach(function() {
    userId = '123';
    angular.mock.module('esn.calendar');
  });

  beforeEach(angular.mock.inject(function(_calendarHomeService_, _session_, _ESN_CONFIG_DEFAULT_, _$rootScope_, _$q_) {
    session = _session_;
    calendarHomeService = _calendarHomeService_;
    $rootScope = _$rootScope_;
    session.user = {
      _id: userId
    };
    session.ready = _$q_.when(session);
  }));

  describe('The getUserCalendarHomeId function', function() {
    it('should return the session user id', function(done) {
      calendarHomeService.getUserCalendarHomeId().then(function(result) {
        expect(result).to.equal(userId);
        done();
      }, done);
      $rootScope.$digest();
    });
  });
});
