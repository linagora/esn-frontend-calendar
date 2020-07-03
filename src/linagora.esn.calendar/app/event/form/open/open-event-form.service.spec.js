'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calOpenEventForm service', function() {
  var calOpenEventForm, calEventFormService, calDefaultValue, calEventUtils;
  var fallbackCalendarHomeId, fallbackCalendarId, event, relatedEvents;

  beforeEach(function() {
    fallbackCalendarHomeId = 'fallbackCalendarHomeId';
    fallbackCalendarId = 'fallbackCalendarId';

    event = {
      uid: '456',
      calendarHomeId: 'eventCalendarHomeId',
      calendarId: 'eventCalendarId'
    };

    relatedEvents = [];

    calEventFormService = {
      openEventForm: sinon.stub()
    };

    calEventUtils = {};

    module('esn.calendar');
    module(function($provide) {
      $provide.value('calEventFormService', calEventFormService);
      $provide.value('calEventUtils', calEventUtils);
    });

    inject(function(_calOpenEventForm_, _calDefaultValue_) {
      calOpenEventForm = _calOpenEventForm_;
      calDefaultValue = _calDefaultValue_;
    });
  });

  beforeEach(function() {
    calDefaultValue.set('calendarId', fallbackCalendarId);
  });

  it('should open event form with fallback calendar values when it is a new event', function() {
    calEventUtils.isNew = function() { return true; };

    calOpenEventForm(fallbackCalendarHomeId, event, relatedEvents);

    expect(calEventFormService.openEventForm).to.have.been.calledWith(fallbackCalendarHomeId, fallbackCalendarId, sinon.match(event), relatedEvents);
  });

  it('should open event form with calendar info from existing events', function() {
    calEventUtils.isNew = function() { return false; };

    calOpenEventForm(fallbackCalendarHomeId, event, relatedEvents);

    expect(calEventFormService.openEventForm).to.have.been.calledWith(event.calendarHomeId, event.calendarId, sinon.match(event), relatedEvents);
  });
});
