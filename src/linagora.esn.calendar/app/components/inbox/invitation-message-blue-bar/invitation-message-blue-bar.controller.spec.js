'use strict';

/* global chai: false, sinon: false, __FIXTURES__: false */

var expect = chai.expect;

describe('The calInboxInvitationMessageBlueBarController', function() {
  var $componentController, $rootScope, $q, calOpenEventForm, calEventService, session, shells = {}, CalendarShell, ICAL, INVITATION_MESSAGE_HEADERS;

  function initCtrl(method, uid, sequence, recurrenceId, sender, attachments) {
    var headers = {};

    headers[INVITATION_MESSAGE_HEADERS.METHOD] = method;
    headers[INVITATION_MESSAGE_HEADERS.UID] = uid;
    headers[INVITATION_MESSAGE_HEADERS.SEQUENCE] = sequence;
    headers[INVITATION_MESSAGE_HEADERS.RECURRENCE_ID] = recurrenceId;

    return $componentController('calInboxInvitationMessageBlueBar', null, {
      message: {
        attachments: attachments || [],
        from: {
          email: sender
        },
        headers: headers
      }
    });
  }

  function qReject(err) {
    return function() {
      return $q.reject(err);
    };
  }

  function qResolve(value) {
    return function() {
      return $q.when(value);
    };
  }

  beforeEach(function() {
    module('esn.calendar');

    calOpenEventForm = sinon.spy();

    module(function($provide) {
      $provide.value('calOpenEventForm', calOpenEventForm);
      $provide.value('calendarHomeService', {
        getUserCalendarHomeId: function() {
          return $q.when('cal');
        }
      });
      $provide.value('calendarAPI', {
        listCalendars: function() {
          return $q.when([]);
        }
      });
      $provide.value('calEventService', {
        changeParticipation: sinon.spy(function() {
          return $q.when(new CalendarShell(shells.recurringEventWithTwoExceptions.vcalendar, { etag: 'updatedEtag' }));
        }),
        getEventByUID: function() {
          return $q.when(shells.event);
        }
      });
    });
  });

  beforeEach(inject(function(_$componentController_, _$q_, _$rootScope_, _CalendarShell_, _calEventService_, _session_,
                             _ICAL_, _INVITATION_MESSAGE_HEADERS_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    CalendarShell = _CalendarShell_;
    calEventService = _calEventService_;
    session = _session_;

    ICAL = _ICAL_;
    INVITATION_MESSAGE_HEADERS = _INVITATION_MESSAGE_HEADERS_;
  }));

  beforeEach(function() {
    ['event', 'recurringEventWithTwoExceptions', 'singleWithAttendees', 'singleWithoutAttendee', 'eventRequestRegular'].forEach(function(file) {
      shells[file] = new CalendarShell(ICAL.Component.fromString(__FIXTURES__[('frontend/app/fixtures/calendar/' + file + '.ics')]), {
        etag: 'etag',
        path: 'path'
      });
    });
  });

  describe('The $onInit method', function() {

    it('should expose a "meeting" object, initialized from the message headers', function() {
      var ctrl = initCtrl('REPLY', '1234', '1');

      ctrl.$onInit();

      expect(ctrl.meeting).to.deep.equal({
        method: 'REPLY',
        uid: '1234',
        recurrenceId: undefined,
        sequence: '1'
      });
    });

    it('should expose a "meeting" object, defaulting for METHOD and SEQUENCE', function() {
      var ctrl = initCtrl(null, '1234', null);

      ctrl.$onInit();

      expect(ctrl.meeting).to.deep.equal({
        method: 'REQUEST',
        uid: '1234',
        recurrenceId: undefined,
        sequence: '0'
      });
    });

    it('should report an error if the event cannot be fetched from the calendar', function() {
      var ctrl = initCtrl('REQUEST', '1234', '0');

      calEventService.getEventByUID = qReject('WTF');
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.error).to.equal('WTF');
    });

    it('should report an invalid meeting (but no error) if the event is not found in the calendar', function() {
      var ctrl = initCtrl('REQUEST', '1234', '0');

      calEventService.getEventByUID = qReject({ status: 404 }); // err is supposed to be a HTTP response
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(true);
      expect(ctrl.meeting.error).to.equal(undefined);
    });

    it('should fetch the event using the UID present in the message headers', function() {
      var ctrl = initCtrl('REQUEST', '1234', '0', '20170115T100000Z'); // This occurrence does not exist

      calEventService.getEventByUID = function(calendarHomeId, uid) {
        expect(calendarHomeId).to.equal('cal');
        expect(uid).to.equal('1234');

        return $q.reject({ status: 404 });
      };
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(true);
    });

    it('should report an invalid meeting if the specified occurrence does not exist', function() {
      var ctrl = initCtrl('REQUEST', '1234', '0', '20170115T100000Z'); // This occurrence does not exist

      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(true);
    });

    it('should set the occurence when counter and recurrenceId is defined', function() {
      var ctrl = initCtrl('COUNTER', '1234', '2', '20170115T100000Z');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(undefined);
      expect(ctrl.event).to.not.equal(shells.recurringEventWithTwoExceptions);
    });

    it('should set the master meeting if counter and the recurrenceId is not defined', function() {
      var ctrl = initCtrl('COUNTER', '1234', '0', null, 'admin@open-paas.org');

      session.user.emails = ['admin@open-paas.org'];
      calEventService.getEventByUID = qResolve(shells.singleWithAttendees);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(undefined);
      expect(ctrl.event).to.deep.equal(shells.singleWithAttendees);
    });

    it('should report an invalid meeting if the current user is not involved in the event', function() {
      var ctrl = initCtrl('REQUEST', '1234', '0'); // This occurrence does not exist

      session.user.emails = {};
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(true);
    });

    it('should NOT report error when user is the organizer and there is no attendee', function() {
      var ctrl = initCtrl('REQUEST', '1234', '1');

      session.user.emails = ['admin@open-paas.org'];
      calEventService.getEventByUID = qResolve(shells.singleWithoutAttendee);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.be.undefined;
      expect(ctrl.meeting.loaded).to.equal(true);
    });

    it('should report an invalid meeting if the sequence is outdated', function() {
      var ctrl = initCtrl('REQUEST', '1234', '0'); // Event sequence is 2

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(true);
    });

    it('should expose the event', function() {
      var ctrl = initCtrl('REQUEST', '1234', '2');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.invalid).to.equal(undefined);
      expect(ctrl.event).to.deep.equal(shells.recurringEventWithTwoExceptions);
    });

    it('should expose a loaded=true when event loading process is successful', function() {
      var ctrl = initCtrl('REQUEST', '1234', '2');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.loaded).to.equal(true);
    });

    it('should expose a loaded=true when event loading process fails', function() {
      var ctrl = initCtrl('REQUEST', '1234', '2');

      calEventService.getEventByUID = qReject('WTF');
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.meeting.loaded).to.equal(true);
    });

    it('should not expose the replyAttendee when the meeting is not a reply', function() {
      var ctrl = initCtrl('REQUEST', '1234', '2');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.replyAttendee).to.equal(undefined);
    });

    it('should not expose the replyAttendee when the meeting is a reply but the attendee is not found', function() {
      var ctrl = initCtrl('REQUEST', '1234', '2', null, 'another@open-paas.org');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.replyAttendee).to.equal(undefined);
    });

    it('should expose the replyAttendee when the meeting is a reply and the attendee is found', function() {
      var ctrl = initCtrl('REPLY', '1234', '2', null, 'ddolcimascolo@linagora.com');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.replyAttendee).to.shallowDeepEqual({
        email: 'ddolcimascolo@linagora.com',
        partstat: 'NEEDS-ACTION'
      });
    });

    it('should expose the replyAttendee when the meeting is a counter and the attendee is found', function() {
      var ctrl = initCtrl('COUNTER', '1234', '2', null, 'ddolcimascolo@linagora.com');

      session.user.emails = ['admin@linagora.com'];
      calEventService.getEventByUID = qResolve(shells.recurringEventWithTwoExceptions);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.replyAttendee).to.shallowDeepEqual({
        email: 'ddolcimascolo@linagora.com',
        partstat: 'NEEDS-ACTION'
      });
    });
  });

  describe('When method is COUNTER', function() {
    it('should fetch the ICS from application/ics attachment and set it in context', function() {
      var url = 'http://localhost:1080/jmap/attachment/2';
      var attachments = [{
        type: 'foo',
        getSignedDownloadUrl: sinon.stub().returns($q.reject(new Error('Should not be called')))
      }, {
        type: 'application/ics',
        getSignedDownloadUrl: sinon.stub().returns($q.when(url))
      }, {
        type: 'application/ics',
        getSignedDownloadUrl: sinon.stub().returns($q.reject(new Error('Should not be called')))
      }];
      var ctrl = initCtrl('COUNTER', '1234', '2', null, null, attachments);

      calEventService.getEventByUID = sinon.stub().returns($q.when(shells.recurringEventWithTwoExceptions));
      calEventService.getEventFromICSUrl = sinon.stub().returns($q.when(shells.recurringEventWithTwoExceptions));
      session.user.emails = ['admin@linagora.com'];

      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.additionalEvent).to.be.defined;
      expect(attachments[0].getSignedDownloadUrl).to.not.have.been.called;
      expect(attachments[1].getSignedDownloadUrl).to.have.been.calledOnce;
      expect(attachments[2].getSignedDownloadUrl).to.not.have.been.called;
      expect(calEventService.getEventFromICSUrl).to.have.been.calledWith(url);
      expect(ctrl.meeting.error).to.not.be.defined;
    });

    it('should fetch the ICS from text/calendar attachment and set it in context', function() {
      var url = 'http://localhost:1080/jmap/attachment/2';
      var attachments = [{
        type: 'foo',
        getSignedDownloadUrl: sinon.stub().returns($q.reject(new Error('Should not be called')))
      }, {
        type: 'text/calendar',
        getSignedDownloadUrl: sinon.stub().returns($q.when(url))
      }, {
        type: 'text/calendar',
        getSignedDownloadUrl: sinon.stub().returns($q.reject(new Error('Should not be called')))
      }];
      var ctrl = initCtrl('COUNTER', '1234', '2', null, null, attachments);

      calEventService.getEventByUID = sinon.stub().returns($q.when(shells.recurringEventWithTwoExceptions));
      calEventService.getEventFromICSUrl = sinon.stub().returns($q.when(shells.recurringEventWithTwoExceptions));
      session.user.emails = ['admin@linagora.com'];

      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.additionalEvent).to.be.defined;
      expect(attachments[0].getSignedDownloadUrl).to.not.have.been.called;
      expect(attachments[1].getSignedDownloadUrl).to.have.been.calledOnce;
      expect(attachments[2].getSignedDownloadUrl).to.not.have.been.called;
      expect(calEventService.getEventFromICSUrl).to.have.been.calledWith(url);
      expect(ctrl.meeting.error).to.not.be.defined;
    });
  });

  describe('The openEvent function', function() {
    it('should open form with relatedEvents array when additional is defined', function() {
      var url = 'http://localhost:1080/jmap/attachment/2';
      var attachments = [{
        type: 'foo',
        getSignedDownloadUrl: sinon.stub().returns($q.reject(new Error('Should not be called')))
      }, {
        type: 'text/calendar',
        getSignedDownloadUrl: sinon.stub().returns($q.when(url))
      }, {
        type: 'text/calendar',
        getSignedDownloadUrl: sinon.stub().returns($q.reject(new Error('Should not be called')))
      }];
      var ctrl = initCtrl('COUNTER', '1234', '2', null, null, attachments);

      calEventService.getEventByUID = sinon.stub().returns($q.when(shells.recurringEventWithTwoExceptions));
      calEventService.getEventFromICSUrl = sinon.stub().returns($q.when(shells.recurringEventWithTwoExceptions));
      session.user.emails = ['admin@linagora.com'];

      ctrl.$onInit();
      $rootScope.$digest();

      ctrl.openEvent();

      expect(calOpenEventForm).to.have.been.calledWith(ctrl.userCalendarHomeId, ctrl.event, [{
        type: 'counter',
        event: shells.recurringEventWithTwoExceptions,
        actor: ctrl.replyAttendee
      }]);
    });
  });

  describe('The isActionable function', function() {
    it('should return true when user is an attendee (RSVP required)', function() {
      var ctrl = initCtrl('REQUEST', '1234', '1');

      session.user.emails = ['b@example.com'];
      calEventService.getEventByUID = qResolve(shells.eventRequestRegular);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.isActionable()).to.equal(true);
    });

    it('should return false when user is also event organizer (no action required)', function() {
      var ctrl = initCtrl('REQUEST', '1234', '1');

      session.user.emails = ['admin@open-paas.org'];
      calEventService.getEventByUID = qResolve(shells.singleWithoutAttendee);
      ctrl.$onInit();
      $rootScope.$digest();

      expect(ctrl.isActionable()).to.equal(false);
    });
  });
});
