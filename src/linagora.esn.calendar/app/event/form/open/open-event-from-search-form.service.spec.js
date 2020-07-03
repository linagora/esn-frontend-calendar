'use strict';

/* global chai, sinon, _, __FIXTURES__: false */

var expect = chai.expect;

describe('The calOpenEventFromSearchForm service', function() {
  var $rootScope, $q, ICAL, calOpenEventFromSearchForm, calEventFormService, calendarAPI;
  var publicNormalEvent, privateNormalEvent, recurrenceException, relatedEvents;

  beforeEach(function() {
    recurrenceException = {
      uid: 'cbdf2ff0-c6e0-413f-8984-0f70a86e9866',
      userId: 'eventCalendarHomeId',
      calendarId: 'eventCalendarId',
      class: 'PUBLIC',
      recurrenceId: '2017-01-14T10:00:00Z'
    };

    publicNormalEvent = {
      uid: '457',
      userId: 'eventCalendarHomeId',
      calendarId: 'eventCalendarId',
      class: 'PUBLIC'
    };

    privateNormalEvent = {
      uid: '458',
      userId: 'eventCalendarHomeId',
      calendarId: 'eventCalendarId',
      class: 'PRIVATE'
    };

    relatedEvents = [];

    calEventFormService = {
      openEventForm: sinon.stub()
    };

    calendarAPI = {
      getEventByUID: sinon.stub()
    };

    module('esn.calendar');
    module(function($provide) {
      $provide.value('calEventFormService', calEventFormService);
      $provide.value('calendarAPI', calendarAPI);
    });

    inject(function(_$rootScope_, _$q_, _ICAL_, _calOpenEventFromSearchForm_) {
      ICAL = _ICAL_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      calOpenEventFromSearchForm = _calOpenEventFromSearchForm_;
    });
  });

  it('should open event form with public recurrence exception from search', function() {
    calOpenEventFromSearchForm(recurrenceException, relatedEvents);

    expect(calEventFormService.openEventForm).to.have.been.calledWith(recurrenceException.userId, recurrenceException.calendarId, sinon.match(function(event) {
      if (!event.isPublic()) return false;
      if (!event.isInstance()) return false;

      return true;
    }), relatedEvents);
  });

  it('should open event form with public normal event from search', function() {
    calOpenEventFromSearchForm(publicNormalEvent, relatedEvents);

    expect(calEventFormService.openEventForm).to.have.been.calledWith(recurrenceException.userId, recurrenceException.calendarId, sinon.match(function(event) {
      if (!event.isPublic()) return false;
      if (event.isInstance()) return false;

      return true;
    }), relatedEvents);
  });

  it('should open event form with private normal event from search', function() {
    calOpenEventFromSearchForm(privateNormalEvent, relatedEvents);

    expect(calEventFormService.openEventForm).to.have.been.calledWith(recurrenceException.userId, recurrenceException.calendarId, sinon.match(function(event) {
      if (event.isPublic()) return false;
      if (event.isInstance()) return false;

      return true;
    }), relatedEvents);
  });

  it('should inject fetchFullEvent function to event from search before opening event form for recurrence exception', function(done) {
    calOpenEventFromSearchForm(recurrenceException, relatedEvents);

    var results = [{
      _links: { self: { href: '/calendar/eventCalendarHomeId/eventCalendarId/recurringEventWithTwoExceptions.ics' } },
      etag: 'etag',
      data: ICAL.Component.fromString(__FIXTURES__[('frontend/app/fixtures/calendar/recurringEventWithTwoExceptions.ics')]).toJSON()
    }];

    var actualEvent;

    calendarAPI.getEventByUID = sinon.stub().returns($q.when(results));

    expect(calEventFormService.openEventForm).to.have.been.calledWith(recurrenceException.userId, recurrenceException.calendarId, sinon.match(function(event) {
      if (!event.isPublic()) return false;
      if (!event.isInstance()) return false;

      actualEvent = event;

      return true;
    }), relatedEvents);

    actualEvent.fetchFullEvent().then(function(calendarShell) {
      expect(calendarShell.summary).to.equal('Recurring !!');
      expect(calendarShell.location).to.equal('Elsewhere');
      var recurrenceId = calendarShell.vevent.getFirstPropertyValue('recurrence-id').toJSDate().toISOString().split('.')[0] + 'Z';

      expect(recurrenceId).to.equal(recurrenceException.recurrenceId);
      done();
    });

    $rootScope.$digest();
  });

  it('should inject fetchFullEvent function to event from search before opening event form for master event', function(done) {
    var masterEvent = _.assign(recurrenceException);

    delete masterEvent.recurrenceId;

    calOpenEventFromSearchForm(masterEvent, relatedEvents);

    var results = [{
      _links: { self: { href: '/calendar/eventCalendarHomeId/eventCalendarId/recurringEventWithTwoExceptions.ics' } },
      etag: 'etag',
      data: ICAL.Component.fromString(__FIXTURES__[('frontend/app/fixtures/calendar/recurringEventWithTwoExceptions.ics')]).toJSON()
    }];

    var actualEvent;

    calendarAPI.getEventByUID = sinon.stub().returns($q.when(results));

    expect(calEventFormService.openEventForm).to.have.been.calledWith(recurrenceException.userId, recurrenceException.calendarId, sinon.match(function(event) {
      if (!event.isPublic()) return false;
      if (event.isInstance()) return false;

      actualEvent = event;

      return true;
    }), relatedEvents);

    actualEvent.fetchFullEvent().then(function(calendarShell) {
      expect(calendarShell.summary).to.equal('Recurring !!');
      expect(calendarShell.location).to.equal('Elsewhere');
      expect(calendarShell.vevent.getFirstPropertyValue('rrule')).to.exist;
      expect(calendarShell.vevent.getFirstPropertyValue('recurrence-id')).to.not.exist;
      done();
    });

    $rootScope.$digest();
  });
});
