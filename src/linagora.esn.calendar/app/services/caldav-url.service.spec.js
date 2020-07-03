'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calCalDAVURLService service', function() {
  var calCalDAVURLService, calendar, url, $window, $q, $log, $rootScope, esnUserConfigurationService;

  beforeEach(function() {
    url = 'http://davserverurl';

    calendar = {
      href: 'calendars/123/456.json'
    };

    esnUserConfigurationService = {
      get: sinon.stub()
    };

    angular.mock.module('esn.calendar');

    angular.mock.module(function($provide) {
      $provide.value('esnUserConfigurationService', esnUserConfigurationService);
    });

    angular.mock.inject(function(_$q_, _$log_, _calCalDAVURLService_, _$window_, _$rootScope_) {
      calCalDAVURLService = _calCalDAVURLService_;
      $window = _$window_;
      $q = _$q_;
      $log = _$log_;
      $rootScope = _$rootScope_;
    });
  });

  describe('The getCalendarURL function', function() {
    beforeEach(function() {
      esnUserConfigurationService.get.returns($q.when([{name: 'davserver', value: {frontend: {url: url}}}]));
    });

    it('should send right url even when configuration one contains trailing /', function(done) {
      url += '/';

      calCalDAVURLService.getCalendarURL(calendar).then(function(_url) {
        expect(_url).to.equal(url + 'calendars/123/456');
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should send right url even when calendar href contains leading /', function(done) {
      calendar.href = '/' + calendar.href;

      calCalDAVURLService.getCalendarURL(calendar).then(function(_url) {
        expect(_url).to.equal(url + '/calendars/123/456');
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should send right url even when calendar href contains trailing / and no .json', function(done) {
      calendar.href = 'calendars/123/456';

      calCalDAVURLService.getCalendarURL(calendar).then(function(_url) {
        expect(_url).to.equal(url + '/calendars/123/456');
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should send right url even when calendar href contains trailing prefix', function(done) {
      calendar.href = 'sdav/calendars/123/456.json';

      calCalDAVURLService.getCalendarURL(calendar).then(function(_url) {
        expect(_url).to.equal(url + '/calendars/123/456');
        done();
      }, done);

      $rootScope.$digest();
    });
  });

  describe('The getFrontendURL function', function() {
    var logSpy;

    beforeEach(function() {
      logSpy = sinon.spy($log, 'debug');
    });

    it('should resolve with window.location.origin when esnUserConfigurationService.get rejects', function(done) {
      var error = new Error('I failed to get configuration');

      esnUserConfigurationService.get.returns($q.reject(error));

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.have.been.calledWith('Can not get davserver from configuration', error);
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with window.location.origin when esnUserConfigurationService.get does not send back results', function(done) {
      esnUserConfigurationService.get.returns($q.when());

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.have.been.calledWith('No valid configurations found for davserver');
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with window.location.origin when esnUserConfigurationService.get send back empty result', function(done) {
      esnUserConfigurationService.get.returns($q.when([]));

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.have.been.calledWith('No valid configurations found for davserver');
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with window.location.origin when esnUserConfigurationService.get does not send back davserver configuration', function(done) {
      esnUserConfigurationService.get.returns($q.when([{name: 'notdavserverconfiguration'}]));

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.have.been.calledWith('davserver configuration is not set');
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with window.location.origin when davserver configuration value is not defined', function(done) {
      esnUserConfigurationService.get.returns($q.when([{name: 'davserver'}]));

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.not.have.been.called;
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with window.location.origin when davserver configuration value frontend is not defined', function(done) {
      esnUserConfigurationService.get.returns($q.when([{name: 'davserver', value: {}}]));

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.not.have.been.called;
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with window.location.origin when davserver configuration value frontend url is not defined', function(done) {
      esnUserConfigurationService.get.returns($q.when([{name: 'davserver', value: {frontend: {}}}]));

      calCalDAVURLService.getFrontendURL().then(function(url) {
        expect(url).to.be.defined;
        expect(url).to.equal($window.location.origin);
        expect(logSpy).to.not.have.been.called;
        done();
      }, done);

      $rootScope.$digest();
    });

    it('should resolve with dav url', function(done) {
      esnUserConfigurationService.get.returns($q.when([{name: 'davserver', value: {frontend: {url: url}}}]));

      calCalDAVURLService.getFrontendURL().then(function(_url) {
        expect(_url).to.equal(url);
        expect(logSpy).to.not.have.been.called;
        done();
      }, done);

      $rootScope.$digest();
    });
  });
});
