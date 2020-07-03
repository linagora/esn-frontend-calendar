'use strict';

/* global sinon, chai: false */

var expect = chai.expect;

describe('The calEventUtils service', function() {
  var event, userEmail, esnI18nServiceMock, momentUTCOffsetStub;

  beforeEach(function() {
    var emailMap = {};

    userEmail = 'aAttendee@open-paas.org';
    emailMap[userEmail] = true;

    esnI18nServiceMock = {
      translate: sinon.stub()
    };

    var session = {
      user: {
        _id: '123456',
        emails: [userEmail],
        emailMap: emailMap
      },
      domain: {
        company_name: 'test'
      }
    };

    momentUTCOffsetStub = sinon.stub();

    module('esn.calendar');
    module('esn.ical');
    module(function($provide) {
      $provide.factory('session', function($q) {
        session.ready = $q.when(session);

        return session;
      });

      $provide.constant('moment', function() {
        return {
          utcOffset: momentUTCOffsetStub
        };
      });

      $provide.constant('esnI18nService', esnI18nServiceMock);
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
      isPrivate: sinon.stub().returns(false)
    };
  });

  beforeEach(inject(function(calEventUtils, $rootScope, calMoment, CalendarShell, session, CAL_MAX_DURATION_OF_SMALL_EVENT, CAL_EVENT_FORM, CAL_ICAL) {
    this.calEventUtils = calEventUtils;
    this.$rootScope = $rootScope;
    this.calMoment = calMoment;
    this.CalendarShell = CalendarShell;
    this.session = session;
    this.CAL_MAX_DURATION_OF_SMALL_EVENT = CAL_MAX_DURATION_OF_SMALL_EVENT;
    this.CAL_EVENT_FORM = CAL_EVENT_FORM;
    this.CAL_ICAL = CAL_ICAL;
    event.start = calMoment();
    event.end = event.start.add(this.CAL_MAX_DURATION_OF_SMALL_EVENT.DESKTOP, 'minutes');
  }));

  describe('isOrganizer function', function() {

    it('should return true when the event organizer is the current user', function() {
      var event = {
        organizer: {
          email: 'aAttendee@open-paas.org'
        }
      };

      expect(this.calEventUtils.isOrganizer(event)).to.be.true;
    });

    it('should return false when the event organizer is not the current user', function() {
      var event = {
        organizer: {
          email: 'not-organizer@bar.com'
        }
      };

      expect(this.calEventUtils.isOrganizer(event)).to.be.false;
    });

    it('should return true when the event is undefined', function() {
      expect(this.calEventUtils.isOrganizer(null)).to.be.true;
    });

    it('should return true when the event organizer is undefined', function() {
      var event = {
        organizer: null
      };

      expect(this.calEventUtils.isOrganizer(event)).to.be.true;
    });
  });

  describe('hasSignificantChange function', function() {
    it('should return true when the events do not have the same start date', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 10:00:00')
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 08:00:00'),
        end: this.calMoment('2015-01-01 10:00:00')
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.true;
    });

    it('should return true when the events do not have the same end date', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 10:00:00')
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00')
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.true;
    });

    it('should return true when the events do not have the same due property', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due1'
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due2'
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.true;
    });

    it('should return true when the events do not have the same rrule', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          until: this.calMoment('2015-01-03 11:00:00').toDate()
        }
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          until: this.calMoment('2015-01-02 11:00:00').toDate()
        }
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.true;
    });

    it('should return true when the events do not have the same exdate', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          frequency: 1
        },
        exdate: [
          this.calMoment('2015-01-02 11:00:00')
        ]
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          frequency: 1
        },
        exdate: [
          this.calMoment('2015-01-03 11:00:00')
        ]
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.true;
    });

    it('should return true when the events do not have the same status', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          frequency: 1
        },
        exdate: [
          this.calMoment('2015-01-02 11:00:00')
        ],
        status: 'REFUSED'
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          frequency: 1
        },
        exdate: [
          this.calMoment('2015-01-02 11:00:00')
        ],
        status: 'ACCEPTED'
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.true;
    });

    it('should return false when the events are the same', function() {
      var newEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          frequency: 1
        },
        exdate: [
          this.calMoment('2015-01-02 11:00:00')
        ],
        status: 'ACCEPTED'
      });
      var oldEvent = this.CalendarShell.fromIncompleteShell({
        start: this.calMoment('2015-01-01 09:00:00'),
        end: this.calMoment('2015-01-01 11:00:00'),
        due: 'due',
        rrule: {
          frequency: 1
        },
        exdate: [
          this.calMoment('2015-01-02 11:00:00')
        ],
        status: 'ACCEPTED'
      });

      expect(this.calEventUtils.hasSignificantChange(oldEvent, newEvent)).to.be.false;
    });
  });

  describe('isNew function', function() {
    it('should return true if event.dtstamp is falsy (undefined, null, etc)', function() {
      expect(this.calEventUtils.isNew({})).to.be.true;
    });

    it('should return false if event.dtstamp is truthy', function() {
      expect(this.calEventUtils.isNew({ dtstamp: '2020-01-07T07:00:00.000Z' })).to.be.false;
    });
  });

  describe('setBackgroundColor function', function() {
    it('should set the background color of the good calendar', function() {

      var event = {
        id: 'paint it black',
        calendarId: 'altamont'
      };

      var calendars = [{id: 'woodstock', color: 'pink'}, {id: 'altamont', color: 'black'}];

      expect(this.calEventUtils.setBackgroundColor(event, calendars)).to.equal(event);
      expect(event.backgroundColor).to.equal('black');
    });
  });

  describe('hasAttendees fn', function() {
    it('should return false when undefined', function() {
      expect(this.calEventUtils.hasAttendees({})).to.be.false;
    });

    it('should return false when = 0 ', function() {
      expect(this.calEventUtils.hasAttendees({
        attendees: []
      })).to.be.false;
    });

    it('should return true when > 0', function() {
      expect(this.calEventUtils.hasAttendees({
        attendees: ['1']
      })).to.be.true;
    });
  });

  describe('getUserAttendee fn', function() {

    it('should return undefined when event has no "attendees" property', function() {
      expect(this.calEventUtils.getUserAttendee({})).to.equal(undefined);
    });

    it('should return undefined when event has 0 attendees', function() {
      expect(this.calEventUtils.getUserAttendee({ attendees: [] })).to.equal(undefined);
    });

    it('should return undefined when user is not found in event attendees', function() {
      expect(this.calEventUtils.getUserAttendee({
        attendees: [{
          email: 'contact@domain.com'
        }]
      })).to.equal(undefined);
    });

    it('should return user when user is found in event attendees', function() {
      var attendee = {
        email: 'aAttendee@open-paas.org'
      };

      expect(this.calEventUtils.getUserAttendee({ attendees: [attendee] })).to.deep.equal(attendee);
    });

  });

  describe('The getEventTitle function', function() {
    it('should send back trimmed title', function() {
      var title = 'The title of the event';

      expect(this.calEventUtils.getEventTitle({ title: '   ' + title + '       ' })).to.equal(title);
    });

    it('should send back translated "no title" when event title is only spaces', function() {
      var title = 'translated title';

      esnI18nServiceMock.translate.returns(title);

      expect(this.calEventUtils.getEventTitle({ title: '       ' })).to.equal(title);
      expect(esnI18nServiceMock.translate).to.have.been.calledWith(this.CAL_EVENT_FORM.title.default);
    });

    it('should send back translated "no title" when event title is empty string', function() {
      var title = 'translated title';

      esnI18nServiceMock.translate.returns(title);

      expect(this.calEventUtils.getEventTitle({ title: '' })).to.equal(title);
      expect(esnI18nServiceMock.translate).to.have.been.calledWith(this.CAL_EVENT_FORM.title.default);
    });

    it('should send back translated "no title" when event title is undefined', function() {
      var title = 'translated title';

      esnI18nServiceMock.translate.returns(title);

      expect(this.calEventUtils.getEventTitle({})).to.equal(title);
      expect(esnI18nServiceMock.translate).to.have.been.calledWith(this.CAL_EVENT_FORM.title.default);
    });
  });

  describe('The canSuggestChanges function', function() {
    it('should return true when user is not organizer but attendee', function() {
      var event = this.CalendarShell.fromIncompleteShell({
        _id: '123456',
        start: this.calMoment('2013-02-08 12:30'),
        end: this.calMoment('2013-02-08 13:30'),
        organizer: {
          email: 'notorg@test.com'
        },
        attendees: [
          {
            displayName: 'attendee1',
            email: this.session.user.emails[0],
            cutype: this.CAL_ICAL.cutype.individual
          }
        ]
      });

      expect(this.calEventUtils.canSuggestChanges(event, this.session.user)).to.be.true;
    });

    it('should return false when user is not organizer and not attendee', function() {
      var event = this.CalendarShell.fromIncompleteShell({
        _id: '123456',
        start: this.calMoment('2013-02-08 12:30'),
        end: this.calMoment('2013-02-08 13:30'),
        organizer: {
          email: 'notorg@test.com'
        },
        attendees: [
          {
            displayName: 'attendee1',
            email: 'notattendee@test.com',
            cutype: this.CAL_ICAL.cutype.individual
          }
        ]
      });

      expect(this.calEventUtils.canSuggestChanges(event, this.session.user)).to.be.false;
    });

    it('should return false when user is organizer and not attendee', function() {
      var event = this.CalendarShell.fromIncompleteShell({
        _id: '123456',
        start: this.calMoment('2013-02-08 12:30'),
        end: this.calMoment('2013-02-08 13:30'),
        organizer: {
          email: this.session.user.emails[0]
        },
        attendees: [
          {
            displayName: 'attendee1',
            email: 'notattendee@test.com',
            cutype: this.CAL_ICAL.cutype.individual
          }
        ]
      });

      expect(this.calEventUtils.canSuggestChanges(event, this.session.user)).to.be.false;
    });

    it('should return false when user is organizer and attendee', function() {
      var event = this.CalendarShell.fromIncompleteShell({
        _id: '123456',
        start: this.calMoment('2013-02-08 12:30'),
        end: this.calMoment('2013-02-08 13:30'),
        organizer: {
          email: this.session.user.emails[0]
        },
        attendees: [
          {
            displayName: 'attendee1',
            email: this.session.user.emails[0],
            cutype: this.CAL_ICAL.cutype.individual
          }
        ]
      });

      expect(this.calEventUtils.canSuggestChanges(event, this.session.user)).to.be.false;
    });

    it('should return false when event is recurring', function() {
      var event = this.CalendarShell.fromIncompleteShell({
        _id: '123456',
        start: this.calMoment('2013-02-08 12:30'),
        end: this.calMoment('2013-02-08 13:30'),
        organizer: {
          email: 'notorg@test.com'
        },
        attendees: [
          {
            displayName: 'attendee1',
            email: this.session.user.emails[0],
            cutype: this.CAL_ICAL.cutype.individual
          }
        ],
        rrule: {
          freq: 'DAILY',
          interval: 2,
          count: 3
        }
      });

      expect(this.calEventUtils.canSuggestChanges(event, this.session.user)).to.be.false;
    });
  });

  describe('The stripTimeWithTz function', function() {
    it('should not mutate its calMomentDate parameter', function() {
      var calMomentDate = this.calMoment('2019-11-05 09:00');
      var calMomentDateClone = calMomentDate.clone();

      this.calEventUtils.stripTimeWithTz(calMomentDate);

      expect(calMomentDate).to.deep.equal(calMomentDateClone);
    });

    it('should strip time and subtract negative UTC offset', function() {
      var calMomentDate = this.calMoment('2019-11-05 09:00');
      var utcOffset = -420;

      momentUTCOffsetStub.returns(utcOffset);

      var timeStrippedCalMoment = this.calEventUtils.stripTimeWithTz(calMomentDate);

      expect(timeStrippedCalMoment.isSame(calMomentDate.clone().subtract(utcOffset, 'minutes'))).to.be.true;
      expect(timeStrippedCalMoment.hasTime()).to.be.false;
    });

    it('should strip time and not subtract non-negative UTC offset', function() {
      var calMomentDate = this.calMoment('2019-11-05 09:00');
      var utcOffset = 420;

      momentUTCOffsetStub.returns(utcOffset);

      var timeStrippedCalMoment = this.calEventUtils.stripTimeWithTz(calMomentDate);

      expect(timeStrippedCalMoment.isSame(calMomentDate)).to.be.true;
      expect(timeStrippedCalMoment.hasTime()).to.be.false;
    });

    it('should strip time and not subtract negative UTC offset if the subtraction pushes the date to another day', function() {
      var calMomentDate = this.calMoment('2019-11-05 18:00');
      var utcOffset = -420;

      momentUTCOffsetStub.returns(utcOffset);

      var timeStrippedCalMoment = this.calEventUtils.stripTimeWithTz(calMomentDate);

      expect(timeStrippedCalMoment.isSame(calMomentDate)).to.be.true;
      expect(timeStrippedCalMoment.hasTime()).to.be.false;
    });

    it('should strip time and not subtract negative UTC offset if the caller does not want to do so', function() {
      var calMomentDate = this.calMoment('2019-11-05 09:00');
      var utcOffset = -420;

      momentUTCOffsetStub.returns(utcOffset);

      var timeStrippedCalMoment = this.calEventUtils.stripTimeWithTz(calMomentDate, true);

      expect(timeStrippedCalMoment.isSame(calMomentDate)).to.be.true;
      expect(timeStrippedCalMoment.hasTime()).to.be.false;
    });
  });
});
