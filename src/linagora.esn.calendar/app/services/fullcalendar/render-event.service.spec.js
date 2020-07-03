'use strict';

/* global sinon, chai: false */

var expect = chai.expect;

describe('The calFullCalendarRenderEventService service', function() {
  var $q, element, session, calendar, fcTitle, fcTime, fcContent, eventIconsDivInMobile, event, calendarService, calUIAuthorizationService, view, self;
  var esnDatetimeServiceMock, format12, format24;

  function Element() {
    this.innerElements = {};
    this.class = [];
    this.attributes = {};
    this.htmlContent = 'aContent';
  }

  Element.prototype.addClass = function(aClass) {
    this.class.push(aClass);
  };

  Element.prototype.attr = function(name, content) {
    this.attributes[name] = content;
  };

  Element.prototype.html = function(content) {
    if (content) {
      this.htmlContent = content;
    }

    return this.htmlContent;
  };

  Element.prototype.find = function(aClass) {
    return this.innerElements[aClass];
  };

  Element.prototype.remove = sinon.spy();

  Element.prototype.append = sinon.spy();

  Element.prototype.prepend = sinon.spy();

  Element.prototype.css = sinon.spy();

  var userEmail = 'aAttendee@open-paas.org';

  beforeEach(function() {
    self = this;
    var emailMap = {};

    emailMap[userEmail] = true;
    session = {
      user: {
        _id: '123456',
        emails: [userEmail],
        emailMap: emailMap
      },
      domain: {
        company_name: 'test'
      }
    };

    calendar = {
      getOwner: sinon.spy(function() {
        return $q.when(session.user);
      })
    };

    calendarService = {};
    calUIAuthorizationService = {
      canModifyEvent: function() {
        return true;
      }
    };

    format12 = 'h:mm A';
    format24 = 'H:mm';
    esnDatetimeServiceMock = {
      getTimeFormat: sinon.stub().returns('')
    };

    angular.mock.module('esn.calendar');
    angular.mock.module('esn.ical');
    angular.mock.module(function($provide) {
      $provide.factory('session', function($q) {
        session.ready = $q.when(session);

        return session;
      });
      $provide.value('calendarService', calendarService);
      $provide.value('calUIAuthorizationService', calUIAuthorizationService);
      $provide.value('esnDatetimeService', esnDatetimeServiceMock);
    });

    var vcalendar = {};

    vcalendar.hasOwnProperty = null;
    event = {
      title: 'myTitle',
      description: 'description',
      vcalendar: vcalendar,
      attendees: [],
      isInstance: function() { return false; },
      isOverOneDayOnly: sinon.spy(),
      isPublic: sinon.stub().returns(true)
    };

    element = new Element();
    fcContent = new Element();
    fcTitle = new Element();
    fcTime = new Element();
    eventIconsDivInMobile = new Element();
    view = {name: 'month', type: 'month'};
    element.innerElements['.fc-content'] = fcContent;
    element.innerElements['.fc-title'] = fcTitle;
    element.innerElements['.fc-time'] = fcTime;
    fcTitle.innerElements['.event-icons-mobile'] = eventIconsDivInMobile;
    fcTitle.text = sinon.spy();

    this.escapeHTMLMockResult = {};
    this.escapeHTMLMock = {
      escapeHTML: sinon.stub().returns(this.escapeHTMLMockResult)
    };

    this.matchmediaMock = {
      is: sinon.spy()
    };

    angular.mock.module(function($provide) {
      $provide.value('escapeHtmlUtils', self.escapeHTMLMock);
      $provide.value('matchmedia', self.matchmediaMock);
    });
  });

  beforeEach(angular.mock.inject(function(
    _$q_,
    $rootScope,
    calFullCalendarRenderEventService,
    calEventUtils,
    calMoment,
    CalendarShell,
    escapeHtmlUtils,
    matchmedia,
    ESN_MEDIA_QUERY_SM_XS,
    CAL_MAX_DURATION_OF_SMALL_EVENT
  ) {
    this.calFullCalendarRenderEventService = calFullCalendarRenderEventService;
    this.calEventUtils = calEventUtils;
    $q = _$q_;
    this.$rootScope = $rootScope;
    this.calMoment = calMoment;
    this.CalendarShell = CalendarShell;
    this.escapeHtmlUtils = escapeHtmlUtils;
    this.matchmedia = matchmedia;
    this.ESN_MEDIA_QUERY_SM_XS = ESN_MEDIA_QUERY_SM_XS;
    this.CAL_MAX_DURATION_OF_SMALL_EVENT = CAL_MAX_DURATION_OF_SMALL_EVENT;
    event.start = calMoment();
    event.end = event.start.add(this.CAL_MAX_DURATION_OF_SMALL_EVENT.DESKTOP, 'minutes');
    this.recurrentEventIcon = angular.element('<i class="mdi mdi-sync"/>');
    this.maybeEventIcon = angular.element('<i class="mdi mdi-help-circle"/>');
  }));

  describe('The fixTitleDiv function', function() {
    it('should add the fc-title div is not available', function() {
      fcTitle.length = 0;
      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(fcContent.prepend).to.have.been.calledWith('<div class="fc-title"></div>');
    });
  });

  describe('The addTooltipToEvent function', function() {
    it('should add a tooltip in all views', function() {
      fcContent.attr = sinon.spy();
      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(fcContent.attr).to.have.been.calledWith('title', event.title);
    });
  });

  describe('The changeEventColorWhenMonthView function', function() {
    it('should change CSS if we are in month view and the event is not allDay and event.isOverOneDayOnly() return true', function() {
      var backgroundColor = 'blue';

      element.css = sinon.spy(function(attr) {
        if (attr === 'background-color') {
          return backgroundColor;
        }
      });

      event.isOverOneDayOnly = sinon.stub().returns(true);

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(element.css).to.have.been.calledWith('color', backgroundColor);
      expect(element.css).to.have.been.calledWith('background-color', 'transparent');
      expect(fcTime.css).to.have.been.calledWith('background-color', 'transparent');
      expect(element.css).to.have.been.calledWith('border', '0');
    });

    it('should not change CSS if we are in month vue and the event is not allDay and event.isOverOneDayOnly() return false', angular.mock.inject(function() {
      var backgroundColor = 'blue';

      element.css = sinon.spy(function(attr) {
        if (attr === 'background-color') {
          return backgroundColor;
        }
      });

      event.isOverOneDayOnly = sinon.stub().returns(false);

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(element.css).to.have.not.been.called;
    }));

    it('should not change CSS if we are in month view and the event is allDay', function() {
      var backgroundColor = 'blue';

      event.allDay = true;

      element.css = sinon.spy(function(attr) {
        if (attr === 'background-color') {
          return backgroundColor;
        }
      });
      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(element.css).to.have.not.been.called;
    });
  });

  describe('The adaptTitleWhenShortEvent function', function() {
    it('should display event title instead of time if the event duration under the max duration of a small event when user uses 12 hours format', angular.mock.inject(function() {
      element.innerElements['.fc-time'].length = 1;
      element.innerElements['.fc-title'].length = 1;
      fcTime.remove = sinon.spy();
      fcTitle.text = sinon.spy();

      esnDatetimeServiceMock.getTimeFormat = sinon.stub().returns(format12);

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(fcTime.remove).to.have.been.calledOnce;
      expect(esnDatetimeServiceMock.getTimeFormat).to.have.been.calledOnce;
      expect(fcTitle.text).to.have.been.calledWith(event.start.format(format12) + ' - ' + event.title);
    }));

    it('should display event title instead of time if the event duration under the max duration of a small event when user uses 24 hours format', angular.mock.inject(function() {
      element.innerElements['.fc-time'].length = 1;
      element.innerElements['.fc-title'].length = 1;
      fcTime.remove = sinon.spy();
      fcTitle.text = sinon.spy();

      esnDatetimeServiceMock.getTimeFormat = sinon.stub().returns(format24);

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(fcTime.remove).to.have.been.calledOnce;
      expect(esnDatetimeServiceMock.getTimeFormat).to.have.been.calledOnce;
      expect(fcTitle.text).to.have.been.calledWith(event.start.format(format24) + ' - ' + event.title);
    }));
  });

  describe('The appendLocation function', function() {
    it('should display the location if the location is defined', function() {
      event.location = 'location';

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(this.escapeHTMLMock.escapeHTML).to.have.been.calledWith(event.location);
      expect(element.class).to.include('event-with-location');
    });

    it('should not display the location if the location is not defined', function() {
      this.calFullCalendarRenderEventService(calendar)(event, element, view);

      expect(element.class).to.not.include('event-with-location');
    });
  });

  describe('The appendDescription function', function() {
    it('should add a title attribute if description is defined', function() {
      event.description = 'aDescription';

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(this.escapeHTMLMock.escapeHTML).to.have.been.calledWith(event.description);
      expect(element.attributes.title).to.equal(this.escapeHTMLMockResult);
    });

    it('should not add a title attribute if description is not defined', function() {
      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(element.attributes.title).to.deep.equal({});
    });
  });

  describe('The setEventRights function', function() {
    it('should keep startEditable and durationEditable to undefined if the current user can edit event', function() {
      var canModifyEvent = sinon.spy(calUIAuthorizationService, 'canModifyEvent');

      event.organizer = {
        email: userEmail
      };

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(event.startEditable).to.not.exist;
      expect(event.durationEditable).to.not.exist;
      expect(canModifyEvent).to.have.been.calledWith(calendar, event, session.user._id);
    });

    it('should set startEditable and durationEditable to false if the current user can not edit event', function() {
      var canModifyEvent = sinon.stub(calUIAuthorizationService, 'canModifyEvent').returns(false);

      event.organizer = {
        email: 'organizerEmail'
      };
      event.attendees.push({
        email: userEmail
      });

      this.calFullCalendarRenderEventService(calendar)(event, element, view);
      this.$rootScope.$digest();

      expect(event.startEditable).to.be.false;
      expect(event.durationEditable).to.be.false;
      expect(canModifyEvent).to.have.been.calledWith(calendar, event, session.user._id);
    });
  });

  describe('The addIcons function', function() {
    describe('The addIconInEventInstance function', function() {
      describe('In mobile mode', function() {
        beforeEach(function() {
          var ESN_MEDIA_QUERY_SM_XS = this.ESN_MEDIA_QUERY_SM_XS;

          fcTitle.prepend = sinon.spy();

          eventIconsDivInMobile.append = sinon.spy();

          this.matchmedia.is = function(mediaquery) {
            expect(mediaquery).to.equal(ESN_MEDIA_QUERY_SM_XS);

            return true;
          };
        });

        it('should add the event-is-instance class for instances if the event is recurrent', function() {
          event.isInstance = function() { return true; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.include('event-is-instance');
        });

        it('should not add the event-is-instance class for instances if the event is not recurrent', function() {
          event.isInstance = function() { return false; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.not.include('event-is-instance');
        });

        it('should add the recurrent event icon in the title div if the event is recurrent and allDay', function() {
          event.isInstance = function() { return true; };
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-sync"/>');
        });

        it('should add the recurrent event icon in the title div if the event is recurrent and not allDay and event Duration <= one hour', function() {
          event.isInstance = function() { return true; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-sync"/>');
        });

        it('should add the recurrent event icon in the eventIconsDivInMobile div after location if the event is recurrent and not allDay and event duration > one hour', function() {
          event.start = this.calMoment();
          event.end = event.start.clone().add(this.CAL_MAX_DURATION_OF_SMALL_EVENT.MOBILE + 1, 'minutes');

          event.isInstance = function() { return true; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(eventIconsDivInMobile.append).to.have.been.calledWith('<i class="mdi mdi-sync"/>');
        });
      });

      describe('In desktop mode', function() {
        beforeEach(function() {
          var ESN_MEDIA_QUERY_SM_XS = this.ESN_MEDIA_QUERY_SM_XS;

          fcTitle.prepend = sinon.spy();
          fcTime.prepend = sinon.spy();

          this.matchmedia.is = function(mediaquery) {
            expect(mediaquery).to.equal(ESN_MEDIA_QUERY_SM_XS);

            return false;
          };
        });

        it('should add the event-is-instance class for instances if the event is recurrent', function() {
          event.isInstance = function() { return true; };
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.include('event-is-instance');
        });

        it('should not add the event-is-instance class for instances if the event is not recurrent', function() {
          event.isInstance = function() { return false; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.not.include('event-is-instance');
        });

        it('should add the recurrentEventIcon in the title div if the event is recurrent and allDay', function() {
          event.isInstance = function() { return true; };
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-sync"/>');
        });

        it('should add the recurrentEventIcon in the time div if the event is recurrent and not allDay', function() {
          event.isInstance = function() { return true; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTime.prepend).to.have.been.calledWith('<i class="mdi mdi-sync"/>');
        });
      });
    });

    describe('The addIconForAttendees function', function() {
      describe('Attendee selection', function() {
        beforeEach(function() {
          calendar = {
            getOwner: sinon.spy(function() {
              return $q.when({
                emails: [userEmail]
              });
            })
          };
        });

        it('should get calendar owner for participation if attendee', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'DECLINED'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(calendar.getOwner).to.have.been.called;

          expect(element.class).to.deep.equal(['event-declined']);
        });

        it('should not display participation if calendar owner is not attendee', function() {
          event.attendees.push({
            email: 'other@test.com',
            partstat: 'DECLINED'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(calendar.getOwner).to.have.been.called;

          expect(element.class).to.deep.equal([]);
        });
      });

      describe('In mobile mode', function() {
        beforeEach(function() {
          var ESN_MEDIA_QUERY_SM_XS = this.ESN_MEDIA_QUERY_SM_XS;

          fcTitle.prepend = sinon.spy();

          eventIconsDivInMobile.append = sinon.spy();

          this.matchmedia.is = function(mediaquery) {
            expect(mediaquery).to.equal(ESN_MEDIA_QUERY_SM_XS);

            return true;
          };
        });

        it('should add event-needs-action class if current user is found in the DECLINED attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'DECLINED'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-declined']);
        });

        it('should add event-needs-action class if current user is found in the ACCEPTED attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'ACCEPTED'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-accepted']);
        });

        it('should add event-needs-action class if current user is found in the NEEDS-ACTION attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'NEEDS-ACTION'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-needs-action']);
        });

        it('should add event-tentative class if current user is found in the TENTATIVE attendees and the event is an allDay event', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'TENTATIVE'
          });
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-help-circle"/>');
        });

        it('should add maybe event icone before the title if current user is found in the TENTATIVE attendees and the event is not an allDay event and the duration <= one hour', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'TENTATIVE'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-help-circle"/>');
        });

        it('should add maybe event icone after the title if current user is found in the TENTATIVE attendees and the event is not an allDay event and the duration > one hour', function() {
          event.start = this.calMoment();
          event.end = event.start.clone().add(this.CAL_MAX_DURATION_OF_SMALL_EVENT.MOBILE + 1, 'minutes');
          event.attendees.push({
            email: userEmail,
            partstat: 'TENTATIVE'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(eventIconsDivInMobile.append).to.have.been.calledWith('<i class="mdi mdi-help-circle"/>');
        });
      });

      describe('In desktop mode', function() {
        beforeEach(function() {
          var ESN_MEDIA_QUERY_SM_XS = this.ESN_MEDIA_QUERY_SM_XS;

          fcTitle.prepend = sinon.spy();
          fcTime.prepend = sinon.spy();

          this.matchmedia.is = function(mediaquery) {
            expect(mediaquery).to.equal(ESN_MEDIA_QUERY_SM_XS);

            return false;
          };
        });
        it('should add event-needs-action class if current user is found in the DECLINED attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'DECLINED'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-declined']);
        });

        it('should add event-needs-action class if current user is found in the ACCEPTED attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'ACCEPTED'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-accepted']);
        });

        it('should add event-needs-action class if current user is found in the NEEDS-ACTION attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'NEEDS-ACTION'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-needs-action']);
        });

        it('should add event-tentative class if current user is found in the TENTATIVE attendees', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'TENTATIVE'
          });
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(element.class).to.deep.equal(['event-tentative']);
        });

        it('should add maybe event icon in the title div if current user is found in the TENTATIVE attendees and it is an allDay event', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'TENTATIVE'
          });
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-help-circle"/>');
        });

        it('should add maybe event icon in time div if current user is found in the TENTATIVE attendees and it is not an allDay event', function() {
          event.attendees.push({
            email: userEmail,
            partstat: 'TENTATIVE'
          });

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTime.prepend).to.have.been.calledWith('<i class="mdi mdi-help-circle"/>');
        });
      });
    });

    describe('The addIconInPrivateEvent function', function() {
      describe('In mobile mode', function() {
        beforeEach(function() {
          var ESN_MEDIA_QUERY_SM_XS = this.ESN_MEDIA_QUERY_SM_XS;

          fcTitle.prepend = sinon.spy();

          eventIconsDivInMobile.append = sinon.spy();

          this.matchmedia.is = function(mediaquery) {
            expect(mediaquery).to.equal(ESN_MEDIA_QUERY_SM_XS);

            return true;
          };
        });

        it('should add the private event icon in the title div if the event is private and allDay', function() {
          event.isPublic = function() { return false; };
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-lock"/>');
        });

        it('should add the private event icon in the title div if the event is private and not allDay and event Duration <= one hour', function() {
          event.isPublic = function() { return false; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-lock"/>');
        });

        it('should add the private event icon in the eventIconsDivInMobile div after location if the event is private and not allDay and event duration > one hour', function() {
          event.start = this.calMoment();
          event.end = event.start.clone().add(this.CAL_MAX_DURATION_OF_SMALL_EVENT.MOBILE + 1, 'minutes');

          event.isPublic = function() { return false; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(eventIconsDivInMobile.append).to.have.been.calledWith('<i class="mdi mdi-lock"/>');
        });
      });

      describe('In desktop mode', function() {
        beforeEach(function() {
          var ESN_MEDIA_QUERY_SM_XS = this.ESN_MEDIA_QUERY_SM_XS;

          fcTitle.prepend = sinon.spy();
          fcTime.prepend = sinon.spy();

          this.matchmedia.is = function(mediaquery) {
            expect(mediaquery).to.equal(ESN_MEDIA_QUERY_SM_XS);

            return false;
          };
        });
        it('should add the private event icon in the title div if the event is private and allDay', function() {
          event.isPublic = function() { return false; };
          event.allDay = true;

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTitle.prepend).to.have.been.calledWith('<i class="mdi mdi-lock"/>');
        });

        it('should add the private event icon in the time div if the event is private and not allDay', function() {
          event.isPublic = function() { return false; };

          this.calFullCalendarRenderEventService(calendar)(event, element, view);
          this.$rootScope.$digest();

          expect(fcTime.prepend).to.have.been.calledWith('<i class="mdi mdi-lock"/>');
        });
      });
    });
  });
});

