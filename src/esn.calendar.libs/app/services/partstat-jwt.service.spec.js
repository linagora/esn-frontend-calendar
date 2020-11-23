'use strict';

/* global chai, sinon */

const jwtDecode = require('jwt-decode');
const { expect } = chai;

describe('The calPartstatJWTService', function() {
  let $rootScope, calPartstatJWTService, httpConfigurer;
  let httpMock, notificationFactoryMock, calPartstatUpdateNotificationServiceMock, jwtDecodeStub, calendarHomeServiceMock, calEventServiceMock, calOpenEventFormMock, log;
  let jwtDecodedContent, calendarHomeId, event;
  let sandbox, error, rejectedPromise;

  beforeEach(function() {
    error = new Error('Something went wrong');
    rejectedPromise = $q.reject(error);
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    jwtDecodedContent = {};
    jwtDecodeStub = sandbox.stub().returns(jwtDecodedContent);
    jwtDecode.default = jwtDecodeStub;

    httpMock = sandbox.stub().returns($q.when());

    notificationFactoryMock = {
      weakError: sandbox.stub()
    };

    calPartstatUpdateNotificationServiceMock = sandbox.stub();

    calendarHomeId = 'calendarHomeId';

    calendarHomeServiceMock = {
      getUserCalendarHomeId: sandbox.stub().returns($q.when(calendarHomeId))
    };

    event = {};

    calEventServiceMock = {
      getEventByUID: sandbox.stub().returns($q.when(event))
    };

    calOpenEventFormMock = sandbox.stub();

    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.value('$http', httpMock);
      $provide.value('notificationFactory', notificationFactoryMock);
      $provide.value('calPartstatUpdateNotificationService', calPartstatUpdateNotificationServiceMock);
      $provide.value('calendarHomeService', calendarHomeServiceMock);
      $provide.value('calEventService', calEventServiceMock);
      $provide.value('calOpenEventForm', calOpenEventFormMock);
    });
  });

  beforeEach(angular.mock.inject(function(_$rootScope_, _$log_, _calPartstatJWTService_, _httpConfigurer_) {
    $rootScope = _$rootScope_;
    calPartstatJWTService = _calPartstatJWTService_;
    httpConfigurer = _httpConfigurer_;
    log = _$log_;

    httpConfigurer.getUrl = sandbox.stub().returnsArg(0);
    log.error = sandbox.stub();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  describe('The getChangeParticipationURL function', function() {
    it('should return the correct url to change the participation status', function() {
      const jwt = 'jwt';
      const changeParticipationURL = calPartstatJWTService.getChangeParticipationURL(jwt);

      expect(httpConfigurer.getUrl).to.have.been.calledWith('/calendar/api/calendars/event/participation');
      expect(changeParticipationURL).to.equal(`/calendar/api/calendars/event/participation?jwt=${jwt}`);
    });
  });

  describe('The changeParticipationUsingJWT function', function() {
    it('should send a request to change the participation status', function(done) {
      const jwt = 'jwt';

      calPartstatJWTService.changeParticipationUsingJWT(jwt)
        .then(() => {
          expect(httpMock).to.have.been.calledWith({ method: 'GET', url: `/calendar/api/calendars/event/participation?jwt=${jwt}` });
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      $rootScope.$digest();
    });
  });

  describe('The changeParticipationUsingJWTAndDisplayEvent function', function() {
    it('should reject and display an error message when no jwt is found', function(done) {
      calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent()
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err).to.exist;
          expect(err.message).to.equal('There is no jwt to change the participation status');
          expect(log.error).to.have.been.calledWith(err);
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Event participation modification failed');
          done();
        });

      $rootScope.$digest();
    });

    it('should change participation status using the provided jwt and open the event form afterwards', function(done) {
      const jwt = 'jwt';
      const eventUid = 'eventUid';
      const action = 'ACCEPTED';

      jwtDecodedContent.uid = eventUid;
      jwtDecodedContent.action = action;

      calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent(jwt)
        .then(() => {
          expect(httpMock).to.have.been.calledWith({ method: 'GET', url: `/calendar/api/calendars/event/participation?jwt=${jwt}` });
          expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(action);
          expect(calendarHomeServiceMock.getUserCalendarHomeId).to.have.been.calledOnce;
          expect(calEventServiceMock.getEventByUID).to.have.been.calledWith(calendarHomeId, eventUid);
          expect(calOpenEventFormMock).to.have.been.calledWith(null, event);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      expect(jwtDecodeStub).to.have.been.calledWith(jwt);

      $rootScope.$digest();
    });

    it('should display an error notification when the request to change the participation status fails', function(done) {
      const jwt = 'jwt';
      const eventUid = 'eventUid';
      const action = 'ACCEPTED';

      jwtDecodedContent.uid = eventUid;
      jwtDecodedContent.action = action;

      httpMock.returns(rejectedPromise);

      calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent(jwt)
        .then(() => {
          expect(httpMock).to.have.been.calledWith({ method: 'GET', url: `/calendar/api/calendars/event/participation?jwt=${jwt}` });
          expect(calPartstatUpdateNotificationServiceMock).to.have.not.been.called;
          expect(calendarHomeServiceMock.getUserCalendarHomeId).to.have.not.been.called;
          expect(calEventServiceMock.getEventByUID).to.have.not.been.called;
          expect(calOpenEventFormMock).to.have.not.been.called;
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Event participation modification failed');
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      expect(jwtDecodeStub).to.have.been.calledWith(jwt);

      $rootScope.$digest();
    });

    it('should display an error notification when it fails to get the user calendar home id', function(done) {
      const jwt = 'jwt';
      const eventUid = 'eventUid';
      const action = 'ACCEPTED';

      jwtDecodedContent.uid = eventUid;
      jwtDecodedContent.action = action;

      calendarHomeServiceMock.getUserCalendarHomeId = sandbox.stub().returns(rejectedPromise);

      calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent(jwt)
        .then(() => {
          expect(httpMock).to.have.been.calledWith({ method: 'GET', url: `/calendar/api/calendars/event/participation?jwt=${jwt}` });
          expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(action);
          expect(calendarHomeServiceMock.getUserCalendarHomeId).to.have.been.calledOnce;
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Cannot display the event');
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      expect(jwtDecodeStub).to.have.been.calledWith(jwt);

      $rootScope.$digest();
    });

    it('should display an error notification when it fails to fetch the event', function(done) {
      const jwt = 'jwt';
      const eventUid = 'eventUid';
      const action = 'ACCEPTED';

      jwtDecodedContent.uid = eventUid;
      jwtDecodedContent.action = action;

      calEventServiceMock.getEventByUID = sandbox.stub().returns(rejectedPromise);

      calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent(jwt)
        .then(() => {
          expect(httpMock).to.have.been.calledWith({ method: 'GET', url: `/calendar/api/calendars/event/participation?jwt=${jwt}` });
          expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(action);
          expect(calendarHomeServiceMock.getUserCalendarHomeId).to.have.been.calledOnce;
          expect(calEventServiceMock.getEventByUID).to.have.been.calledWith(calendarHomeId, eventUid);
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Cannot display the event');
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      expect(jwtDecodeStub).to.have.been.calledWith(jwt);

      $rootScope.$digest();
    });

    it('should display an error notification when it fails to open the event form', function(done) {
      const jwt = 'jwt';
      const eventUid = 'eventUid';
      const action = 'ACCEPTED';

      jwtDecodedContent.uid = eventUid;
      jwtDecodedContent.action = action;

      calOpenEventFormMock.returns(rejectedPromise);

      calPartstatJWTService.changeParticipationUsingJWTAndDisplayEvent(jwt)
        .then(() => {
          expect(httpMock).to.have.been.calledWith({ method: 'GET', url: `/calendar/api/calendars/event/participation?jwt=${jwt}` });
          expect(calPartstatUpdateNotificationServiceMock).to.have.been.calledWith(action);
          expect(calendarHomeServiceMock.getUserCalendarHomeId).to.have.been.calledOnce;
          expect(calEventServiceMock.getEventByUID).to.have.been.calledWith(calendarHomeId, eventUid);
          expect(calOpenEventFormMock).to.have.been.calledWith(null, event);
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('', 'Cannot display the event');
          done();
        })
        .catch(err => done(err || new Error('should resolve')));

      expect(jwtDecodeStub).to.have.been.calledWith(jwt);

      $rootScope.$digest();
    });
  });
});
