'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The calendar module apis', function() {
  var CAL_GRACE_DELAY_IS_ACTIVE;
  const REQUEST_HEADERS_BASE = { Authorization: 'Bearer jwt' };
  let tokenAPIMock, calCalDAVURLServiceMock;

  function headerContentTypeJsonChecker(header) {
    return header['Content-Type'] === 'application/json';
  }

  beforeEach(function() {
    tokenAPIMock = {
      getWebToken() {
        return $q.when({ data: 'jwt' });
      }
    };

    calCalDAVURLServiceMock = {
      getFrontendURL() {
        return $q.when('');
      }
    };

    angular.mock.module('esn.calendar.libs', function($provide) {
      $provide.constant('CAL_GRACE_DELAY_IS_ACTIVE', CAL_GRACE_DELAY_IS_ACTIVE);
      $provide.value('tokenAPI', tokenAPIMock);
      $provide.value('calCalDAVURLService', calCalDAVURLServiceMock);
    });

    angular.mock.inject(function($httpBackend, calMoment, calendarAPI, calEventAPI, CALENDAR_CONTENT_TYPE_HEADER, CAL_ACCEPT_HEADER, CAL_GRACE_DELAY) {
      this.$httpBackend = $httpBackend;
      this.calMoment = calMoment;
      this.calendarAPI = calendarAPI;
      this.calEventAPI = calEventAPI;
      this.CALENDAR_CONTENT_TYPE_HEADER = CALENDAR_CONTENT_TYPE_HEADER;
      this.CAL_ACCEPT_HEADER = CAL_ACCEPT_HEADER;
      this.CAL_GRACE_DELAY = CAL_GRACE_DELAY;
    });

    var davDateFormat = 'YYYYMMDD[T]HHmmss';

    this.start = this.calMoment('2014-01-01');
    this.end = this.calMoment('2014-01-02');
    this.data = {
      match: { start: this.start.format(davDateFormat), end: this.end.format(davDateFormat) }
    };

    this.vcalendar = {
      id: 'id'
    };

  });

  describe('calEventAPI', function() {
    beforeEach(function() {
      CAL_GRACE_DELAY_IS_ACTIVE = true;
      this.vcalendar.toJSON = angular.identity.bind(null, JSON.stringify(this.vcalendar));
    });

    describe('get request', function() {
      it('should return the http response if status is 200', function(done) {
        this.$httpBackend.expectGET(/^\/calendars\/test\?_=\d+$/, { ...REQUEST_HEADERS_BASE, Accept: this.CAL_ACCEPT_HEADER }).respond(200, 'aResponse');

        this.calEventAPI.get('/calendars/test', this.vcalendar)
          .then(function(response) {
            expect(response.data).to.deep.equal('aResponse');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200', function(done) {
        this.$httpBackend.expectGET(/^\/calendars\/test\?_=\d+$/, { ...REQUEST_HEADERS_BASE, Accept: this.CAL_ACCEPT_HEADER }).respond(500, 'Error');

        this.calEventAPI.get('/calendars/test', this.vcalendar)
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });

    });

    describe('create request', function() {

      it('should return an id if status is 202 and graceperiod is true', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json?graceperiod=' + this.CAL_GRACE_DELAY, this.vcalendar.toJSON()).respond(202, { id: 'anId' });

        this.calEventAPI.create('/calendars/test.json', this.vcalendar, { graceperiod: true })
          .then(function(response) {
            expect(response).to.deep.equal('anId');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 202 and graceperiod is true', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json?graceperiod=' + this.CAL_GRACE_DELAY, this.vcalendar.toJSON()).respond(500, 'Error');

        this.calEventAPI.create('/calendars/test.json', this.vcalendar, { graceperiod: true })
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return a http response if status is 201 and graceperiod is false', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json', this.vcalendar.toJSON()).respond(201, 'aReponse');

        this.calEventAPI.create('/calendars/test.json', this.vcalendar, { graceperiod: false })
          .then(function(response) {
            expect(response.data).to.equal('aReponse');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 201 and graceperiod is true', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json', this.vcalendar.toJSON()).respond(500, 'Error');

        this.calEventAPI.create('/calendars/test.json', this.vcalendar, { graceperiod: false })
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });
    });

    describe('modify request', function() {
      it('should return an id if status is 202', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json?graceperiod=' + this.CAL_GRACE_DELAY, this.vcalendar.toJSON()).respond(202, { id: 'anId' });

        this.calEventAPI.modify('/calendars/test.json', this.vcalendar, 'etag')
          .then(function(response) {
            expect(response).to.deep.equal('anId');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 202', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json?graceperiod=' + this.CAL_GRACE_DELAY, this.vcalendar.toJSON()).respond(500, 'Error');

        this.calEventAPI.modify('/calendars/test.json', this.vcalendar, 'etag')
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });
    });

    describe('getRight method', function() {
      var bodyRequest;

      beforeEach(function() {
        bodyRequest = {
          prop: ['cs:invite', 'acl']
        };
      });

      it('should return an Error if response.status is not 202', function() {
        this.$httpBackend.expect('PROPFIND', '/calendars/calendars/id.json', bodyRequest, headerContentTypeJsonChecker).respond(500, 'Error');

        var catchSpy = sinon.spy();

        this.calendarAPI.getRight('calendars', this.vcalendar).catch(catchSpy);
        this.$httpBackend.flush();

        expect(catchSpy).to.have.been.calledWith(sinon.match({ data: 'Error' }));

      });

      it('should return server body response if success', function() {
        this.$httpBackend.expect('PROPFIND', '/calendars/calendars/id.json', bodyRequest, headerContentTypeJsonChecker).respond(200, 'body');

        var catchSpy = sinon.spy();

        this.calendarAPI.getRight('calendars', this.vcalendar).then(catchSpy);
        this.$httpBackend.flush();

        expect(catchSpy).to.have.been.calledWith(sinon.match.same('body'));
      });
    });

    describe('modifyPublicRights', function() {
      var bodyRequest;

      beforeEach(function() {
        bodyRequest = 'bodyRequest';
      });

      it('should return an error if response.status is not 200', function() {
        var catchSpy = sinon.spy();

        this.$httpBackend.expect('ACL', '/calendars/homeId/calId.json', bodyRequest, headerContentTypeJsonChecker).respond(500, 'Error');
        this.calendarAPI.modifyPublicRights('homeId', 'calId', bodyRequest).catch(catchSpy);
        this.$httpBackend.flush();

        expect(catchSpy).to.have.been.calledWith(sinon.match({ data: 'Error' }));
      });

      it('should return server body response if success', function() {
        var thenSpy = sinon.spy();

        this.$httpBackend.expect('ACL', '/calendars/homeId/calId.json', bodyRequest, headerContentTypeJsonChecker).respond(200, 'body');
        this.calendarAPI.modifyPublicRights('homeId', 'calId', bodyRequest).then(thenSpy);
        this.$httpBackend.flush();

        expect(thenSpy).to.have.been.calledWith;
      });
    });

    describe('modifyShares', function() {
      var bodyRequest;

      beforeEach(function() {
        bodyRequest = 'bodyRequest';
      });

      it('should return an error if response.status is not 200', function() {
        var catchSpy = sinon.spy();

        this.$httpBackend.expect('POST', '/calendars/homeId/calId.json', bodyRequest).respond(500, 'Error');
        this.calendarAPI.modifyShares('homeId', 'calId', bodyRequest).catch(catchSpy);
        this.$httpBackend.flush();

        expect(catchSpy).to.have.been.calledWith(sinon.match({ data: 'Error' }));
      });

      it('should return server body response if success', function() {
        var thenSpy = sinon.spy();

        this.$httpBackend.expect('POST', '/calendars/homeId/calId.json', bodyRequest).respond(200, 'body');
        this.calendarAPI.modifyShares('homeId', 'calId', bodyRequest).then(thenSpy);
        this.$httpBackend.flush();

        expect(thenSpy).to.have.been.calledOnce;
      });
    });

    describe('remove request', function() {
      it('should return an id if status is 202', function(done) {
        this.$httpBackend
          .expectDELETE('/calendars/test.json?graceperiod=' + this.CAL_GRACE_DELAY, {
            ...REQUEST_HEADERS_BASE,
            'If-Match': 'etag',
            Accept: 'application/json, text/plain, */*'
          })
          .respond(202, { id: 'anId' });

        this.calEventAPI.remove('/calendars/test.json', 'etag')
          .then(function(response) {
            expect(response).to.deep.equal('anId');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 202', function(done) {
        this.$httpBackend
          .expectDELETE('/calendars/test.json?graceperiod=' + this.CAL_GRACE_DELAY, {
            ...REQUEST_HEADERS_BASE,
            'If-Match': 'etag',
            Accept: 'application/json, text/plain, */*'
          })
          .respond(500, 'Error');

        this.calEventAPI.remove('/calendars/test.json', 'etag')
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });
    });

    describe('changeParticipation request', function() {
      it('should return a http response if status is 200', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json', this.vcalendar.toJSON()).respond(200, 'aResponse');

        this.calEventAPI.changeParticipation('/calendars/test.json', this.vcalendar, 'etag')
          .then(function(response) {
            expect(response.data).to.equal('aResponse');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return a http response if status is 204', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json', this.vcalendar.toJSON()).respond(204, 'aResponse');

        this.calEventAPI.changeParticipation('/calendars/test.json', this.vcalendar, 'etag')
          .then(function(response) {
            expect(response.data).to.equal('aResponse');
            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200 and not 204', function(done) {
        this.$httpBackend.expectPUT('', this.vcalendar.toJSON()).respond(500, 'Error');

        this.calEventAPI.changeParticipation('/calendars/test.json', this.vcalendar, 'etag')
          .catch(function(err) {
            expect(err).to.exist;
            done();
          });

        this.$httpBackend.flush();
      });
    });

    describe('sendCounter request', function() {
      var eventPath = '/calendars/test.json',
        requestBody = 'UCantTouchThis';

      it('should return a http response if status is 200', function(done) {
        this.$httpBackend.expect('POST', eventPath, requestBody).respond(200, 'aResponse');

        this.calEventAPI.sendCounter(eventPath, requestBody)
          .then(function(response) {
            expect(response.data).to.equal('aResponse');

            done();
          });

        this.$httpBackend.flush();
      });

      it('should return a http response if status is 204', function(done) {
        this.$httpBackend.expect('POST', eventPath, requestBody).respond(204, 'aResponse');

        this.calEventAPI.sendCounter(eventPath, requestBody)
          .then(function(response) {
            expect(response.data).to.equal('aResponse');

            done();
          });

        this.$httpBackend.flush();
      });

      it('should return an Error if response.status is not 200', function(done) {
        this.$httpBackend.expect('POST', eventPath, requestBody).respond(500, 'Error');

        this.calEventAPI.sendCounter(eventPath, requestBody)
          .catch(function(err) {
            expect(err).to.exist;

            done();
          });

        this.$httpBackend.flush();
      });
    });
  });

  describe('calEventApi with graceperiod desactivated', function() {
    var vcalendar;

    beforeEach(function() {
      CAL_GRACE_DELAY_IS_ACTIVE = false;
      vcalendar = {
        id: 'id'
      };

      vcalendar.toJSON = angular.identity.bind(null, JSON.stringify(vcalendar));
    });

    describe('create', function() {
      it('should return a http response if graceperiod is false', function(done) {
        this.$httpBackend.expectPUT('/calendars/test.json', vcalendar.toJSON()).respond(201, 'aReponse');

        this.calEventAPI.create('/calendars/test.json', vcalendar, { })
          .then(function(response) {
            expect(response.data).to.equal('aReponse');

            done();
          });

        this.$httpBackend.flush();
      });
    });

    describe('modify', function() {
      it('should return a http response if graceperiod is false', function(done) {
        var body = { id: 'anId' };

        this.$httpBackend.expectPUT('/calendars/test.json', vcalendar.toJSON()).respond(204, body);

        this.calEventAPI.modify('/calendars/test.json', vcalendar, 'etag')
          .then(function(response) {
            expect(response.data).to.deep.equal(body);

            done();
          });

        this.$httpBackend.flush();
      });
    });

    describe('remove', function() {
      it('should return a http response if graceperiod is false', function(done) {
        var body = { id: 'anId' };

        this.$httpBackend
          .expectDELETE('/calendars/test.json', { ...REQUEST_HEADERS_BASE, 'If-Match': 'etag', Accept: 'application/json, text/plain, */*' })
          .respond(204, body);

        this.calEventAPI.remove('/calendars/test.json', 'etag')
          .then(function(response) {
            expect(response.data).to.deep.equal(body);

            done();
          });

        this.$httpBackend.flush();
      });
    });
  });
});
