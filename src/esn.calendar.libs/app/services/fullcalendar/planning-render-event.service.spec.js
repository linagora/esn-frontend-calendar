'use strict';

/* global sinon, chai: false */

const { expect } = chai;

describe('The calFullCalendarPlanningRenderEventService service', function() {
  let $q, element, session, calendar, event, tr, tds, a, title, fcTime, calUIAuthorizationService, Element;

  beforeEach(function() {
    Element = function Element() {
      this.innerElements = {};
      this.class = [];
    };

    Element.prototype = {
      addClass: function(addedClass) {
        this.class.push(addedClass);
      },
      find: function(addedClass) {
        return this.innerElements[addedClass];
      },
      prepend: sinon.spy()
    };
  });

  const userEmail = 'aAttendee@open-paas.org';

  beforeEach(function() {
    const emailMap = {};

    emailMap[userEmail] = true;
    session = {
      user: {
        emails: [userEmail]
      }
    };

    calUIAuthorizationService = {
      canModifyEvent: function() {
        return true;
      }
    };

    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.factory('session', function($q) {
        session.ready = $q.when(session);

        return session;
      });
      $provide.value('calUIAuthorizationService', calUIAuthorizationService);
    });

    event = {
      attendees: []
    };

    element = new Element();
    title = new Element();
    fcTime = new Element();
    a = new Element();
    tr = new Element();
    tds = new Element();
    element[0] = tr;
    tr.children = tds;
    element.innerElements['.fc-list-item-title'] = title;
    element.innerElements['.fc-list-item-time'] = fcTime;
    title.innerElements.a = a;
    a.text = sinon.spy();
    tr.removeChild = sinon.spy();
    tr.insertBefore = sinon.spy();
  });

  beforeEach(angular.mock.inject(function(
    _$q_,
    $rootScope,
    calFullCalendarPlanningRenderEventService,
    calEventUtils,
    calMoment,
    CalendarShell,
    CAL_MAX_DURATION_OF_SMALL_EVENT
  ) {
    $q = _$q_;
    this.calFullCalendarPlanningRenderEventService = calFullCalendarPlanningRenderEventService;
    this.calEventUtils = calEventUtils;
    this.$rootScope = $rootScope;
    this.calMoment = calMoment;
    this.CalendarShell = CalendarShell;
    this.CAL_MAX_DURATION_OF_SMALL_EVENT = CAL_MAX_DURATION_OF_SMALL_EVENT;
    event.start = calMoment();
    event.end = event.start.add(this.CAL_MAX_DURATION_OF_SMALL_EVENT.DESKTOP, 'minutes');
  }));

  describe('The addStyleForEvent function', function() {
    beforeEach(function() {
      calendar = {
        getOwner: sinon.stub().returns($q.when({
          emails: [userEmail]
        }))
      };
    });

    it('should have planning-event-accepted class if event is accepted', function() {
      event.attendees.push({
        email: userEmail,
        partstat: 'ACCEPTED'
      });
      this.calFullCalendarPlanningRenderEventService(calendar)(event, element);
      this.$rootScope.$digest();

      expect(calendar.getOwner).to.have.been.called;
      expect(element.class).to.deep.equal(['planning-event-accepted']);
    });

    it('should have planning-event-declined class if event is declined', function() {
      event.attendees.push({
        email: userEmail,
        partstat: 'DECLINED'
      });
      this.calFullCalendarPlanningRenderEventService(calendar)(event, element);
      this.$rootScope.$digest();

      expect(calendar.getOwner).to.have.been.called;
      expect(element.class).to.deep.equal(['planning-event-declined']);
    });

    it('should have planning-event-tentative class if event is set to maybe', function() {
      event.attendees.push({
        email: userEmail,
        partstat: 'TENTATIVE'
      });
      this.calFullCalendarPlanningRenderEventService(calendar)(event, element);
      this.$rootScope.$digest();

      expect(calendar.getOwner).to.have.been.called;
      expect(element.class).to.deep.equal(['planning-event-tentative']);
    });

    it('should have planning-event-needs-action class if event action haven\'t been decided', function() {
      event.attendees.push({
        email: userEmail,
        partstat: 'NEEDS-ACTION'
      });
      this.calFullCalendarPlanningRenderEventService(calendar)(event, element);
      this.$rootScope.$digest();

      expect(calendar.getOwner).to.have.been.called;
      expect(element.class).to.deep.equal(['planning-event-needs-action']);
    });
  });
});
