'use strict';

/* global chai, sinon, moment, _: false */

const { expect } = chai;

describe('The CalEventFormController controller', function() {
  let Cache, calendarTest, calendars, canModifyEventResult, eventTest, owner, user, start, end, calendarHomeId, initController;
  let $stateMock, calendarHomeServiceMock, calEventServiceMock, notificationFactoryMock, calendarServiceMock, calOpenEventFormMock, closeNotificationStub;
  let calAttendeesDenormalizerService, calAttendeeService, calEventFreeBusyConfirmationModalService, CAL_ICAL, calFreebusyService;
  let $rootScope, $modal, $controller, scope, calEventUtils, calUIAuthorizationService, session, CalendarShell, CAL_EVENT_FORM, CAL_EVENTS, CAL_ALARM_TRIGGER;
  let VideoConfConfigurationServiceMock, $timeout;

  beforeEach(function() {
    eventTest = {};

    $modal = sinon.spy();

    canModifyEventResult = true;

    owner = {
      _id: 'owner',
      firstname: 'owner',
      lastname: 'OWNER',
      emails: ['owner@test.com'],
      emailMap: { 'owner@test.com': true }
    };

    user = {
      _id: '12354',
      firstname: 'first',
      lastname: 'last',
      emails: ['user@test.com'],
      emailMap: { 'user@test.com': true }
    };

    const calendarUtilsMock = {
      getNewStartDate: function() {
        return moment('2013-02-08 09:30');
      },
      getNewEndDate: function() {
        return moment('2013-02-08 10:30');
      }
    };

    calendarTest = {
      href: 'href',
      id: 'id',
      color: 'color',
      selected: true,
      readOnly: true,
      getOwner: function() {
        return $q.when(owner);
      },
      isOwner: sinon.stub().returns(true),
      isSubscription: function() { return false; },
      getUniqueId: function() {
        return '/calendars/' + owner._id + '/id.json';
      },
      isWritable: angular.noop
    };

    calAttendeesDenormalizerService = function(attendees) {return $q.when(attendees);};
    calEventFreeBusyConfirmationModalService = sinon.spy();

    calendars = [
      calendarTest,
      {
        href: 'href2',
        id: 'id2',
        color: 'color2',
        isWritable: angular.noop,
        isSubscription: function() { return false; },
        isOwner: sinon.stub().returns(true),
        getOwner: function() {
          return $q.when(owner);
        },
        getUniqueId: function() {
          return '/calendars/' + owner._id + '/id2.json';
        }
      }, {
        href: 'href3',
        id: 'id3',
        color: 'color',
        selected: true,
        readOnly: true,
        isOwner: sinon.stub().returns(true),
        getOwner: function() {
          return $q.when(owner);
        },
        getUniqueId: function() {
          return '/calendars/' + owner._id + '/calId.json';
        },
        isSubscription: function() { return true; },
        isWritable: angular.noop,
        source: {
          id: 'calId',
          href: 'href4',
          color: 'color',
          selected: true,
          readOnly: true,
          isSubscription: function() { return false; },
          isWritable: angular.noop
        }
      }
    ];

    calEventServiceMock = {
      onEventCreatedOrUpdated: sinon.stub().returns($q.when()),
      createEvent: sinon.spy(function() {
        return $q.when({});
      }),
      changeParticipation: sinon.spy(function() {
        return $q.when({
          etag: 'TEST-ETAG'
        });
      }),
      modifyEvent: function(path, e) { // eslint-disable-line
        eventTest = e;

        return $q.when(true);
      },
      sendCounter: sinon.spy(function() {
        return $q.when(true);
      })
    };

    calendarHomeId = 'calendarHomeId';

    calendarServiceMock = {
      calendarId: '1234',
      listPersonalAndAcceptedDelegationCalendars: sinon.spy(function() {
        return $q.when(calendars);
      })
    };

    const esnDatetimeServiceMock = {
      getTimeFormat: sinon.stub().returns(''),
      is24hourFormat: sinon.stub().returns(true),
      getTimeZone: function() {
        return 'Asia/Ho_Chi_Minh';
      }
    };

    const sessionMock = {
      user: user,
      ready: {
        then: function() {}
      }
    };

    calendarHomeServiceMock = {
      getUserCalendarHomeId: function() {
        return $q.when(sessionMock.user._id);
      }
    };

    closeNotificationStub = sinon.stub();

    notificationFactoryMock = {
      weakInfo: sinon.stub(),
      weakError: sinon.stub(),
      strongInfo: sinon.stub().returns({ close: closeNotificationStub })
    };

    calOpenEventFormMock = sinon.spy();
    $stateMock = {
      is: sinon.stub().returns('to be or not to be'),
      go: sinon.stub().returns('toto')
    };

    Cache = function() {};
    Cache.prototype.get = function() {
      return $q.when({
        data: {
          _id: 'ownerId',
          firstname: 'owner',
          lastname: 'owner',
          emails: ['owner@open-paas.org']
        }
      });
    };

    calFreebusyService = {};

    VideoConfConfigurationServiceMock = {
      getOpenPaasVideoconferenceAppUrl: sinon.stub().returns($q.when('some url'))
    };

    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.decorator('calendarUtils', function($delegate) {
        return angular.extend($delegate, calendarUtilsMock);
      });
      $provide.value('$modal', $modal);
      $provide.value('calAttendeesDenormalizerService', calAttendeesDenormalizerService);
      $provide.value('calEventFreeBusyConfirmationModalService', calEventFreeBusyConfirmationModalService);
      $provide.value('calendarHomeService', calendarHomeServiceMock);
      $provide.value('calEventService', calEventServiceMock);
      $provide.value('calendarService', calendarServiceMock);
      $provide.value('esnDatetimeService', esnDatetimeServiceMock);
      $provide.value('session', sessionMock);
      $provide.value('Cache', Cache);
      $provide.value('notificationFactory', notificationFactoryMock);
      $provide.value('calOpenEventForm', calOpenEventFormMock);
      $provide.value('$state', $stateMock);
      $provide.value('calFreebusyService', calFreebusyService);
      $provide.factory('calEventsProviders', function() {
        return {
          setUpSearchProvider: function() {}
        };
      });
      $provide.value('VideoConfConfigurationService', VideoConfConfigurationServiceMock);
    });
  });

  beforeEach(inject(function(
    _$controller_,
    _$rootScope_,
    _calAttendeeService_,
    _calEventUtils_,
    _calUIAuthorizationService_,
    _session_,
    _CalendarShell_,
    _CAL_EVENTS_,
    _CAL_ALARM_TRIGGER_,
    _CAL_EVENT_FORM_,
    _CAL_ICAL_,
    _$timeout_
  ) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    calAttendeeService = _calAttendeeService_;
    calEventUtils = _calEventUtils_;
    calUIAuthorizationService = _calUIAuthorizationService_;
    session = _session_;
    CalendarShell = _CalendarShell_;
    CAL_EVENTS = _CAL_EVENTS_;
    CAL_ALARM_TRIGGER = _CAL_ALARM_TRIGGER_;
    CAL_EVENT_FORM = _CAL_EVENT_FORM_;
    CAL_ICAL = _CAL_ICAL_;
    $timeout = _$timeout_;
  }));

  beforeEach(function() {
    start = moment('2018-04-30 12:30');
    end = moment('2018-04-30 13:30');
    calFreebusyService.setBulkFreeBusyStatus = sinon.stub().returns($q.when());
    calFreebusyService.setFreeBusyStatus = sinon.stub().returns($q.when());

    calEventUtils.getNewAttendees = function() {
      return [];
    };
    sinon.stub(calUIAuthorizationService, 'canModifyEventRecurrence', function() {
      return true;
    });

    sinon.stub(calUIAuthorizationService, 'canModifyEvent', function() {
      return $q.when(canModifyEventResult);
    });

    sinon.stub(calUIAuthorizationService, 'canModifyEventAttendees', function() {
      return true;
    });

    sinon.stub(calAttendeeService, 'splitAttendeesFromTypeWithResourceDetails', function(attendees) {
      return $q.when({
        users: _.filter(attendees, { cutype: CAL_ICAL.cutype.individual }),
        resources: _.filter(attendees, { cutype: CAL_ICAL.cutype.resource })
      });
    });
  });

  describe('The CalEventFormController controller', function() {

    beforeEach(function() {
      scope.calendarHomeId = calendarHomeId;
      initController = function() {
        $controller('CalEventFormController', {
          $rootScope: $rootScope,
          $scope: scope
        });

        $rootScope.$digest();
      };
    });

    describe('submit function', function() {
      it('should be createEvent if the event is new', function(done) {
        scope.event = CalendarShell.fromIncompleteShell({
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          location: 'aLocation'
        });
        calEventServiceMock.createEvent = function() {
          done();
        };
        initController();
        scope.submit();
        scope.$digest();

        expect(calEventFreeBusyConfirmationModalService).to.not.have.been.called;
      });

      it('should be modifyEvent if event has a gracePeriodTaskId property', function(done) {
        scope.event = CalendarShell.fromIncompleteShell({
          title: 'title',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          location: 'aLocation',
          gracePeriodTaskId: '123456'
        });
        calEventServiceMock.modifyEvent = function() {
          done();
        };
        initController();
        scope.editedEvent = scope.event.clone();
        scope.editedEvent.title = 'newTitle';
        scope.isOrganizer = true;
        scope.submit();

        $rootScope.$digest();

        expect(calEventFreeBusyConfirmationModalService).to.not.have.been.called;
      });

      it('should be modifyEvent if it is an existing event', function(done) {
        calEventUtils.isNew = function() { return false; };
        scope.event = CalendarShell.fromIncompleteShell({
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          title: 'title',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          location: 'aLocation'
        });

        calEventServiceMock.modifyEvent = function() {
          done();
        };
        initController();
        scope.editedEvent = scope.event.clone();
        scope.editedEvent.title = 'newTitle';
        scope.calendar = {
          id: 'calendarId'
        };
        scope.submit();

        $rootScope.$digest();

        expect(calEventFreeBusyConfirmationModalService).to.not.have.been.called;
      });

      it('should test if alarm is undefined in modifyEvent', function(done) {
        const expectedAlarm = {
          trigger: CAL_ALARM_TRIGGER[1].value,
          attendee: 'test@open-paas.org'
        };

        calEventUtils.isNew = function() { return false; };
        scope.event = CalendarShell.fromIncompleteShell({
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          title: 'title',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          location: 'aLocation',
          alarm: expectedAlarm
        });

        calEventServiceMock.modifyEvent = function() {
          done();
        };
        initController();
        scope.editedEvent = scope.event.clone();
        scope.editedEvent.title = 'newTitle';
        scope.calendar = {
          id: 'calendarId'
        };
        scope.submit();

        $rootScope.$digest();

        expect(scope.editedEvent.alarm).to.not.be.undefined;
        expect(scope.editedEvent.alarm).to.equal(expectedAlarm);
      });

      it('should call calEventFreeBusyConfirmationModalService when some attendees are busy', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          attendees: [{
            displayName: 'attendee1',
            email: 'attendee1@openpaas.org',
            cutype: CAL_ICAL.cutype.individual
          }, {
            displayName: 'resource1',
            email: 'resource1@openpaas.org',
            cutype: CAL_ICAL.cutype.resource
          }]
        });

        calEventServiceMock.createEvent = sinon.spy();
        initController();
        scope.attendees.users[0].freeBusy = 'busy';
        scope.submit();
        $rootScope.$digest();

        expect(calEventServiceMock.createEvent).to.not.have.been.called;
        expect(calEventFreeBusyConfirmationModalService).to.have.been.called;
      });
    });

    describe('initFormData function', function() {

      it('should initialize the scope with $scope.editedEvent as a clone of $scope.event and add ', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          otherProperty: 'aString'
        });
        const clone = CalendarShell.fromIncompleteShell({ _id: 'theclone' });

        scope.event.clone = sinon.spy(function() {
          return clone;
        });
        initController();
        expect(scope.editedEvent).to.equal(clone);
      });

      it('should select the selected calendar from calendarService.listPersonalAndAcceptedDelegationCalendars if new event', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        initController();

        expect(scope.selectedCalendar.uniqueId).to.equal(calendarTest.getUniqueId());
      });

      it('should select the calendar of the event from calendarService.listPersonalAndAcceptedDelegationCalendars if not new event', function() {
        calEventUtils.isNew = function() { return false; };
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        scope.event.path = '/' + owner._id + '/' + calendars[1].id + '/eventID';
        initController();

        expect(scope.selectedCalendar.uniqueId).to.equal(calendars[1].getUniqueId());
      });

      it('should select the calendar of the event from source if calendar is a subscription', function() {
        calEventUtils.isNew = function() { return false; };
        scope.event = CalendarShell.fromIncompleteShell({
          path: '/calendars/calId/calendarId/eventId.ics',
          start: start,
          end: end
        });
        scope.event.path = '/' + owner._id + '/' + calendars[2].source.id + '/eventID';
        initController();

        expect(scope.selectedCalendar.uniqueId).to.equal(calendars[2].getUniqueId());
      });

      it('should call calendarService.listPersonalAndAcceptedDelegationCalendars with options object', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });

        initController();

        expect(calendarServiceMock.listPersonalAndAcceptedDelegationCalendars).to.be.calledWith(calendarHomeId);
      });

      it('should initialize calendars with calendars returned from the calendarService.listPersonalAndAcceptedDelegationCalendars', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });

        initController();

        $rootScope.$digest();

        expect(scope.calendars).to.deep.equal(calendars);
      });

      it('should initialize canModifyEvent with true if calendar.readOnly is true', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          organizer: {
            email: 'user@test.com'
          },
          otherProperty: 'aString'
        });

        initController();

        $rootScope.$digest();

        expect(scope.canModifyEvent).to.equal(true);
      });

      it('should leverage calUIAuthorizationService.canModifyEventAttendees to set canModifyEventAttendees', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          organizer: {
            email: 'user2@test.com'
          },
          otherProperty: 'aString'
        });

        initController();

        $rootScope.$digest();

        expect(calUIAuthorizationService.canModifyEventAttendees).to.have.been.calledWith(
          sinon.match(function(calendar) { return calendar.getUniqueId() === scope.selectedCalendar.uniqueId; }),
          scope.editedEvent,
          session.user._id
        );
      });

      it('should leverage calUIAuthorizationService.canModifyEvent to set canModifyEvent', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          organizer: {
            email: 'user2@test.com'
          },
          otherProperty: 'aString'
        });

        initController();

        expect(calUIAuthorizationService.canModifyEventAttendees).to.have.been.calledWith(
          sinon.match(function(calendar) { return calendar.getUniqueId() === scope.selectedCalendar.uniqueId; }),
          scope.editedEvent,
          session.user._id
        );
      });

      it('should detect if organizer', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          organizer: {
            email: 'user@test.com'
          },
          otherProperty: 'aString'
        });
        initController();

        expect(scope.isOrganizer).to.equal(true);
      });

      it('should detect if not organizer', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          organizer: {
            email: 'other@test.com'
          },
          otherProperty: 'aString'
        });
        initController();

        expect(scope.isOrganizer).to.equal(false);
      });

      it('should initialize the class property with the default value if it is a new event', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });

        initController();

        expect(scope.editedEvent.class).to.equal(CAL_EVENT_FORM.class.default);
      });

      it('should initialize the attendees and resources lists from event.attendees', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          attendees: [{
            displayName: 'attendee1',
            email: 'attendee1@openpaas.org',
            cutype: CAL_ICAL.cutype.individual
          }, {
            displayName: 'resource1',
            email: 'resource1@openpaas.org',
            cutype: CAL_ICAL.cutype.resource
          }]
        });

        initController();

        expect(scope.attendees.users).to.shallowDeepEqual([{ displayName: 'attendee1' }]);
        expect(scope.attendees.resources).to.shallowDeepEqual([{ displayName: 'resource1' }]);
      });

      it('should set inputSuggestions from scope.relatedEvents', function() {
        const relatedCounterEvent = {
          type: 'counter',
          event: {},
          actor: { id: '1' }
        };
        const relatedFooEvent = {
          type: 'foo',
          event: {},
          actor: { id: '1' }
        };

        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          attendees: [{
            displayName: 'attendee1',
            email: 'attendee1@openpaas.org',
            cutype: CAL_ICAL.cutype.individual
          }, {
            displayName: 'resource1',
            email: 'resource1@openpaas.org',
            cutype: CAL_ICAL.cutype.resource
          }]
        });

        scope.relatedEvents = [relatedCounterEvent, relatedFooEvent];

        initController();

        expect(scope.inputSuggestions).to.deep.equal([relatedCounterEvent]);
      });

      it('should initialize freebusy status for all attendees', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          attendees: [{
            displayName: 'attendee1',
            email: 'attendee1@openpaas.org',
            cutype: CAL_ICAL.cutype.individual
          }, {
            displayName: 'resource1',
            email: 'resource1@openpaas.org',
            cutype: CAL_ICAL.cutype.resource
          }]
        });
        initController();
        scope.$digest();

        expect(calFreebusyService.setBulkFreeBusyStatus).to.have.been.calledOnce;
      });

      it('should fetch full event when the provided event is from search', function() {
        const fetchFullEvent = sinon.stub().returns(
          $q.when(CalendarShell.fromIncompleteShell({
            start: start,
            end: end
          }))
        );

        scope.event = {
          fetchFullEvent: fetchFullEvent
        };
        initController();
        scope.$digest();

        expect(fetchFullEvent).to.have.been.calledOnce;
        expect(scope.editedEvent.start.isSame(start)).to.be.true;
        expect(scope.editedEvent.end.isSame(end)).to.be.true;
      });
    });

    describe('displayParticipation function', function() {
      beforeEach(function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          attendees: [session.user]
        });
      });

      it('should initialize displayParticipationButton with false if user is attendee and calendar.readOnly is true', function() {
        calendarServiceMock.listPersonalAndAcceptedDelegationCalendars = sinon.spy(function() {
          return $q.when([{
            readOnly: true,
            selected: true,
            isOwner: sinon.stub().returns(true),
            getOwner: function() {
              return $q.when(owner);
            },
            getUniqueId: function() {
              return calendarTest.getUniqueId();
            }
          }]);
        });

        initController();

        $rootScope.$digest();

        expect(scope.displayParticipationButton).to.equal(false);
      });

      it('should initialize displayParticipationButton with true if user is attendee and calendar.readOnly is false', function() {
        calendarServiceMock.listPersonalAndAcceptedDelegationCalendars = sinon.spy(function() {
          return $q.when([{
            readOnly: false,
            selected: true,
            isOwner: sinon.stub().returns(true),
            getOwner: function() {
              return $q.when(user);
            },
            getUniqueId: function() {
              return calendarTest.getUniqueId();
            }
          }]);
        });

        initController();

        $rootScope.$digest();

        expect(scope.displayParticipationButton).to.equal(true);
      });
    });

    describe('modifyEvent function', function() {
      beforeEach(function() {
        calEventUtils.hasSignificantChange = function() {
        };
      });

      describe('as an organizer', function() {
        it('should call modifyEvent with options.notifyFullcalendar true only if the state is calendar.main', function() {
          scope.event = CalendarShell.fromIncompleteShell({
            title: 'title',
            start: start,
            end: end
          });
          $stateMock.is = sinon.stub().returns(true);
          calEventServiceMock.modifyEvent = sinon.spy(function(path, event, oldEvent, etag, onCancel, options) { // eslint-disable-line
            expect(options).to.deep.equal({
              graceperiod: true,
              notifyFullcalendar: true
            });

            return $q.when();
          });

          initController();

          scope.modifyEvent();

          $rootScope.$digest();

          expect($stateMock.is).to.have.been.calledWith('calendar.main');
        });

        it('should not send modify request if no change', function(done) {
          scope.event = CalendarShell.fromIncompleteShell({
            start: moment('2013-02-08 12:30'),
            end: moment('2013-02-08 13:30'),
            title: 'title'
          });
          scope.$hide = done;
          initController();

          scope.editedEvent = scope.event;
          scope.modifyEvent();
        });

        it('should send modify request with an organizer if it is undefined and has attendees', function() {
          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            attendees: [{
              name: 'attendee1',
              email: 'attendee1@openpaas.org',
              partstart: 'ACCEPTED'
            }]
          });
          initController();

          scope.editedEvent = CalendarShell.fromIncompleteShell({
            start: moment(),
            end: moment(),
            title: 'newTitle',
            attendees: [{
              name: 'attendee1',
              email: 'attendee1@openpaas.org',
              partstart: 'ACCEPTED'
            }]
          });

          calEventServiceMock.modifyEvent = sinon.spy(function() {
            return $q.when();
          });

          scope.modifyEvent();
          scope.$digest();

          expect(calEventServiceMock.modifyEvent).to.have.been.calledWith(sinon.match.any, scope.editedEvent);
        });

        it('should send modify request if deep changes (attendees)', function() {
          scope.event = CalendarShell.fromIncompleteShell({
            start: moment(),
            end: moment(),
            title: 'title',
            attendees: [{
              name: 'attendee1',
              email: 'attendee1@openpaas.org',
              partstart: 'DECLINED'
            }, {
              name: 'attendee2',
              email: 'attendee2@openpaas.org',
              partstart: 'ACCEPTED'
            }]
          });
          initController();

          scope.attendees.users = [{
            name: 'attendee1',
            email: 'attendee1@openpaas.org',
            partstat: 'ACCEPTED'
          }, {
            name: 'attendee2',
            email: 'attendee2@openpaas.org',
            partstat: 'ACCEPTED'
          }];
          scope.editedEvent = CalendarShell.fromIncompleteShell({
            start: moment(),
            end: moment(),
            title: 'title',
            attendees: scope.attendees.users
          });

          calEventServiceMock.modifyEvent = sinon.spy(function() {
            return $q.when();
          });

          scope.modifyEvent();

          scope.$digest();

          const calendarId = calendarTest.id;
          const expectedPath = '/calendars/' + calendarHomeId + '/' + calendarId;

          expect($stateMock.is).to.have.been.called;
          expect(calEventServiceMock.modifyEvent).to.have.been.calledWith(expectedPath, scope.editedEvent, scope.event, scope.etag, sinon.match.any, {
            graceperiod: true,
            notifyFullcalendar: $stateMock.is()
          });
        });

        it('should not send modify request if properties not visible in the UI changed', function(done) {
          let editedEvent = {};

          scope.event = CalendarShell.fromIncompleteShell({
            start: moment(),
            end: moment(),
            title: 'title',
            diff: 123123
          });
          const event = scope.event;

          scope.$hide = function() {
            expect(event.diff).to.equal(123123);
            expect(editedEvent.diff).to.equal(234234);

            done();
          };
          initController();

          scope.editedEvent = event.clone();
          editedEvent = scope.editedEvent;
          scope.editedEvent.diff = 234234;
          scope.modifyEvent();
        });

        it('should add newAttendees', function() {
          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'oldtitle',
            path: '/path/to/event',
            attendees: [{
              name: 'attendee1',
              email: 'user1@test.com',
              partstart: 'ACCEPTED'
            }]
          });
          initController();

          scope.attendees.users = [{
            displayName: 'attendee1',
            email: 'user1@test.com',
            partstart: 'ACCEPTED'
          }];
          scope.editedEvent = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            attendees: scope.attendees.users
          });
          scope.newAttendees = [{
            displayName: 'attendee2',
            email: 'user2@test.com',
            partstart: 'ACCEPTED'
          }, {
            displayName: 'attendee3',
            email: 'user3@test.com',
            partstart: 'ACCEPTED'
          }];
          scope.modifyEvent();

          $rootScope.$digest();

          expect(eventTest).to.shallowDeepEqual({
            title: 'title',
            attendees: [{
              displayName: 'attendee1',
              email: 'user1@test.com'
            }, {
              displayName: 'attendee2',
              email: 'user2@test.com'
            }, {
              displayName: 'attendee3',
              email: 'user3@test.com'
            }]
          });
        });

        it('should keep initial attendees if they are removed then added again to keep initial partstat', function() {
          const attendee = { displayName: 'attendee1', email: 'user1@test.com', partstat: 'ACCEPTED' };
          const addedAttendee = { displayName: 'attendee1', email: 'user1@test.com', partstat: 'NEEDS-ACTION' };
          const resource = { displayName: 'resource1', email: 'resource1@test.com', partstat: 'ACCEPTED' };
          const addedResource = { displayName: 'resource1', email: 'resource1@test.com', partstat: 'NEEDS-ACTION' };

          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'oldtitle',
            path: '/path/to/event',
            attendees: []
          });
          initController();

          scope.attendees.users = [attendee];
          scope.attendees.resources = [resource];
          scope.editedEvent = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            attendees: scope.attendees.users
          });
          scope.onUserAttendeeRemoved(attendee);
          scope.onResourceAttendeeRemoved(resource);
          scope.newAttendees = [
            addedAttendee,
            {
              displayName: 'attendee2',
              email: 'user2@test.com',
              partstat: 'ACCEPTED'
            }, {
              displayName: 'attendee3',
              email: 'user3@test.com',
              partstat: 'ACCEPTED'
            }];
          scope.newResources = [addedResource];
          scope.attendees.users = [];
          scope.attendees.resources = [];
          scope.modifyEvent();

          $rootScope.$digest();

          expect(eventTest).to.shallowDeepEqual({
            title: 'title',
            attendees: [
              attendee,
              {
                displayName: 'attendee2',
                email: 'user2@test.com',
                partstat: 'ACCEPTED'
              }, {
                displayName: 'attendee3',
                email: 'user3@test.com',
                partstat: 'ACCEPTED'
              },
              resource
            ]
          });
        });

        it('should cache attendees and resources', function() {
          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'oldtitle',
            path: '/path/to/event',
            attendees: [{
              name: 'attendee1',
              email: 'user1@test.com',
              partstart: 'ACCEPTED'
            }]
          });
          initController();

          const attendeesCacheSpy = sinon.spy(calEventUtils, 'setNewAttendees');
          const resourcesCacheSpy = sinon.spy(calEventUtils, 'setNewResources');

          const newAttendees = [{
            email: 'user1@test.com'
          }, {
            email: 'user2@test.com'
          }];

          const newResources = [{
            email: 'resource1@test.com'
          }, {
            email: 'resource2@test.com'
          }];

          scope.newAttendees = newAttendees;
          scope.newResources = newResources;
          scope.modifyEvent();

          $rootScope.$digest();

          expect(attendeesCacheSpy).to.have.been.calledWith(newAttendees);
          expect(resourcesCacheSpy).to.have.been.calledWith(newResources);
        });

        it('should pass along the etag', function() {
          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'oldtitle',
            path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
            etag: '123123'
          });
          initController();

          scope.editedEvent = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            path: '/path/to/event',
            etag: '123123'
          });

          calEventServiceMock.modifyEvent = sinon.spy(function(path, event, oldEvent, etag) {
            expect(event.title).to.equal('title');
            expect(oldEvent.title).to.equal('oldtitle');
            expect(path).to.equal('/calendars/' + owner._id + '/' + calendars[1].id + '/eventID');
            expect(etag).to.equal('123123');

            return $q.when();
          });

          scope.modifyEvent();

          scope.$digest();

          expect(calEventServiceMock.modifyEvent).to.have.been.called;
        });

        it('should removeAllException if rrule has been changed', function() {
          const editedEvent = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
            etag: '123123',
            getOrganizerPartStat: _.constant(),
            attendees: [],
            equals: _.constant(false),
            deleteAllException: sinon.spy(),
            setOrganizerPartStat: _.constant()
          });

          scope.event = {
            title: 'oldtitle',
            path: '/path/to/event',
            rrule: {
              equals: _.constant(false)
            },
            etag: '123123',
            clone: _.constant(editedEvent)
          };

          initController();

          scope.modifyEvent();

          expect(scope.editedEvent.deleteAllException).to.have.been.calledOnce;
        });

        it('should not removeAllException if rrule has not been changed', function() {
          const editedEvent = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
            etag: '123123',
            getOrganizerPartStat: _.constant(),
            attendees: [],
            equals: _.constant(true),
            deleteAllException: sinon.spy(),
            setOrganizerPartStat: _.constant()
          });

          scope.event = {
            title: 'oldtitle',
            path: '/path/to/event',
            rrule: {
              equals: _.constant(false)
            },
            etag: '123123',
            clone: _.constant(editedEvent)
          };

          initController();

          scope.modifyEvent();

          expect(scope.editedEvent.deleteAllException).to.not.have.been.called;
        });

        it('should resetStoredEvents when event update is successful', function() {
          const restoreSpy = sinon.spy(calEventUtils, 'resetStoredEvents');

          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'oldtitle',
            path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
            etag: '123123'
          });
          initController();

          scope.editedEvent = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'title',
            path: '/path/to/event',
            etag: '123123'
          });

          calEventServiceMock.modifyEvent = sinon.stub().returns($q.when(true));
          scope.modifyEvent();
          scope.$digest();

          expect(calEventServiceMock.modifyEvent).to.have.been.calledOnce;
          expect(restoreSpy).to.have.been.calledOnce;
        });

        it('should restore attendees and reopen form when event update failed', function() {
          const restoreSpy = sinon.spy(calEventUtils, 'resetStoredEvents');
          const attendees = [{
            name: 'attendee1',
            email: 'user1@test.com',
            partstart: 'ACCEPTED'
          }];

          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end,
            title: 'oldtitle',
            path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
            etag: '123123'
          });
          initController();

          scope.editedEvent = CalendarShell.fromIncompleteShell({
            title: 'title',
            path: '/path/to/event',
            etag: '123123',
            attendees: attendees
          });

          calEventServiceMock.modifyEvent = sinon.stub().returns($q.when(false));
          scope.modifyEvent();
          scope.$digest();

          expect(calEventServiceMock.modifyEvent).to.have.been.calledOnce;
          expect(restoreSpy).to.not.have.been.called;
          expect(calOpenEventFormMock).to.have.been.calledWith(sinon.match.any, scope.editedEvent);
        });
      });

      describe('as an attendee', function() {
        beforeEach(function() {
          canModifyEventResult = false;
        });

        it('should changeParticipation with ACCEPTED', function(done) {
          let status = null;

          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end
          });
          calEventServiceMock.changeParticipation = function(path, event, emails, _status_) { // eslint-disable-line
            status = _status_;

            return $q.when({});
          };
          initController();

          scope.calendarOwnerAsAttendee = {
            partstat: 'ACCEPTED'
          };
          scope.modifyEvent();
          scope.$digest();

          expect(status).to.equal('ACCEPTED');
          expect(notificationFactoryMock.weakInfo).to.have.been.called;

          done();
        });

        it('should no displayNotification if response is null', function(done) {
          let status = null;

          scope.event = CalendarShell.fromIncompleteShell({
            start: start,
            end: end
          });
          calEventServiceMock.changeParticipation = function(path, event, emails, _status_) { // eslint-disable-line
            status = _status_;

            return $q.when(null);
          };
          initController();

          scope.calendarOwnerAsAttendee = {
            partstat: 'DECLINED'
          };
          scope.isOrganizer = false;
          scope.modifyEvent();
          scope.$digest();

          expect(status).to.equal('DECLINED');
          expect(notificationFactoryMock.weakInfo).to.have.not.been.called;

          done();
        });
      });
    });

    describe('changeParticipation function', function() {
      beforeEach(function() {
        calEventUtils.isNew = function() {
          return false;
        };
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          path: '/calendars/' + owner._id + '/' + calendarTest.id + '/eventID',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          organizer: user,
          attendees: [owner],
          otherProperty: 'aString'
        });

        canModifyEventResult = false;
        $stateMock.go = sinon.spy();
        scope.$hide = sinon.spy();
        initController();
        scope.isOrganizer = false;
        scope.$digest();
      });

      it('should update the event', function() {
        let status;

        calEventServiceMock.changeParticipation = function(path, event, emails, _status_) { // eslint-disable-line
          status = _status_;

          return $q.when({});
        };

        scope.changeParticipation('ACCEPTED');
        scope.$digest();

        expect(status).to.equal('ACCEPTED');
        expect(scope.$hide).to.not.have.been.called;
      });

      it('should call calEventService.changeParticipation', function() {
        scope.changeParticipation('ACCEPTED');

        expect(calEventServiceMock.changeParticipation).to.have.been.called;
        expect(scope.$hide).to.not.have.been.called;
      });

      it('should call the calEventService.changeParticipation when an organizer is changing his partstat', function() {
        scope.editedEvent.organizer = { ...owner, email: 'owner@test.com' };
        scope.calendarOwnerAsAttendee.email = 'owner@test.com';
        scope.editedEvent.getOrganizerPartStat = sinon.stub().returns('NEEDS-ACTION');
        scope.editedEvent.setOrganizerPartStat = sinon.spy();

        scope.changeParticipation('ACCEPTED');

        expect(scope.editedEvent.setOrganizerPartStat).to.have.been.called;
        expect(calEventServiceMock.changeParticipation).to.have.been.called;
      });

      it('should update the event and editedEvent etag after updating the organizer partstat', function() {
        scope.editedEvent.organizer = { ...owner, email: 'owner@test.com' };
        scope.calendarOwnerAsAttendee.email = 'owner@test.com';
        scope.editedEvent.getOrganizerPartStat = sinon.stub().returns('NEEDS-ACTION');
        scope.editedEvent.setOrganizerPartStat = sinon.spy();

        scope.changeParticipation('ACCEPTED');
        scope.$digest();

        expect(scope.editedEvent.setOrganizerPartStat).to.have.been.called;
        expect(scope.editedEvent.etag).to.eq('TEST-ETAG');
        expect(scope.event.etag).to.eq('TEST-ETAG');
      });

      it('should not call the calEventService.changeParticipation if the organizer status did not change', function() {
        scope.editedEvent.organizer = { ...owner, email: 'owner@test.com' };
        scope.calendarOwnerAsAttendee.email = 'owner@test.com';
        scope.editedEvent.getOrganizerPartStat = sinon.stub().returns('NEEDS-ACTION');
        scope.editedEvent.setOrganizerPartStat = sinon.spy();

        scope.changeParticipation('NEEDS-ACTION');

        expect(scope.editedEvent.setOrganizerPartStat).to.not.have.been.called;
        expect(calEventServiceMock.changeParticipation).to.not.have.been.called;
      });

      it('should disable the form action buttons while changing the organizer partstat', function() {
        scope.editedEvent.organizer = { ...owner, email: 'owner@test.com' };
        scope.calendarOwnerAsAttendee.email = 'owner@test.com';
        scope.editedEvent.getOrganizerPartStat = sinon.stub().returns('NEEDS-ACTION');
        calEventServiceMock.changeParticipation = function() {
          expect(scope.restActive).to.eq(true);

          return $q.when({ etag: 'something' });
        };

        scope.changeParticipation('ACCEPTED');
      });
    });

    describe('createEvent function', function() {
      beforeEach(function() {
        scope.event = CalendarShell.fromIncompleteShell({
          _id: '123456',
          start: moment('2013-02-08 12:30'),
          end: moment('2013-02-08 13:30'),
          otherProperty: 'aString'
        });
        initController();
      });

      it('should call createEvent with options.notifyFullcalendar true only if the state is calendar.main', function() {
        $stateMock.is = sinon.stub().returns(true);
        calEventServiceMock.createEvent = sinon.spy(function(calendar, event, options) {
          expect(options).to.deep.equal({
            graceperiod: true,
            notifyFullcalendar: true
          });

          return $q.when();
        });

        scope.createEvent();
        scope.$digest();

        expect($stateMock.is).to.have.been.calledWith('calendar.main');
      });

      it('should force title to empty string if the edited event has no title', function() {
        scope.createEvent();

        expect(scope.editedEvent.title).to.equal('');
      });

      it('should initialize the class with \'public\' if the edited event has no class', function() {
        scope.createEvent();

        expect(scope.editedEvent.class).to.equal('PUBLIC');
      });

      it('should add newAttendees from the form', function() {
        const newAttendees = [{
          email: 'user1@test.com'
        }, {
          email: 'user2@test.com'
        }];

        scope.newAttendees = newAttendees;
        scope.createEvent();

        $rootScope.$digest();

        expect(scope.editedEvent).to.shallowDeepEqual({
          title: '',
          attendees: [{
            email: 'user1@test.com'
          }, {
            email: 'user2@test.com'
          }],
          organizer: {
            displayName: 'owner OWNER',
            email: 'owner@test.com'
          }
        });
      });

      it('should cache attendees and resources', function() {
        const attendeesCacheSpy = sinon.spy(calEventUtils, 'setNewAttendees');
        const resourcesCacheSpy = sinon.spy(calEventUtils, 'setNewResources');

        const newAttendees = [{
          email: 'user1@test.com'
        }, {
          email: 'user2@test.com'
        }];

        const newResources = [{
          email: 'resource1@test.com'
        }, {
          email: 'resource2@test.com'
        }];

        scope.newAttendees = newAttendees;
        scope.newResources = newResources;
        scope.createEvent();

        $rootScope.$digest();

        expect(attendeesCacheSpy).to.have.been.calledWith(newAttendees);
        expect(resourcesCacheSpy).to.have.been.calledWith(newResources);
      });

      it('should return error notification when there is no selected calendar', function() {
        scope.selectedCalendar = {};

        scope.createEvent();

        expect(notificationFactoryMock.weakError).to.have.been.calledWith('Event creation failed', 'Cannot join the server, please try later');
      });

      it('should call calOpenEventForm on cancelled task', function() {
        calEventServiceMock.createEvent = function() {
          return $q.when(false);
        };

        scope.createEvent();
        scope.$digest();

        expect(calOpenEventFormMock).to.have.been.called;
      });

      it('should call calEventService.createEvent with the correct parameters', function() {
        scope.createEvent();
        scope.$digest();

        expect($stateMock.is).to.have.been.called;
        expect(calEventServiceMock.createEvent).to.have.been.calledWith(calendarTest, scope.editedEvent, {
          graceperiod: true,
          notifyFullcalendar: $stateMock.is()
        });
      });

      it('should call calEventService.createEvent with calendar owner as organizer when creating event on shared calendar', function() {
        calendarTest.isShared = sinon.stub().returns(true);
        scope.createEvent();
        scope.$digest();

        expect($stateMock.is).to.have.been.called;
        expect(scope.editedEvent.organizer).to.deep.equal({
          fullmail: 'owner OWNER <owner@test.com>',
          email: 'owner@test.com',
          name: 'owner OWNER',
          displayName: 'owner OWNER'
        });
        expect(calEventServiceMock.createEvent).to.have.been.calledWith(calendarTest, scope.editedEvent, {
          graceperiod: true,
          notifyFullcalendar: $stateMock.is()
        });
      });

      it('should resetStoredEvents when event creation is successful', function() {
        const restoreSpy = sinon.spy(calEventUtils, 'resetStoredEvents');

        scope.createEvent();
        scope.$digest();

        expect(restoreSpy).to.have.been.calledOnce;
        expect(calOpenEventFormMock).to.not.have.been.called;
      });

      it('should restore attendees and reopen form when event creation failed', function() {
        const restoreSpy = sinon.spy(calEventUtils, 'resetStoredEvents');

        calEventServiceMock.createEvent = sinon.stub().returns($q.when(false));
        scope.createEvent();
        scope.$digest();

        expect(calEventServiceMock.createEvent).to.have.been.calledOnce;
        expect(restoreSpy).to.not.have.been.called;
        expect(calOpenEventFormMock).to.have.been.calledWith(sinon.match.any, scope.editedEvent);
      });
    });

    describe('canPerformCall function', function() {
      beforeEach(function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        initController();
      });

      it('should return false if scope.restActive is true', function() {
        scope.restActive = true;
        expect(scope.canPerformCall()).to.be.false;
      });

      it('should return true if restActive is false', function() {
        scope.restActive = false;
        expect(scope.canPerformCall()).to.be.true;
      });
    });

    describe('changeParticipation function', function() {
      describe('non-recurring event', function() {
        beforeEach(function() {
          scope.event = CalendarShell.fromIncompleteShell({
            start: moment('2013-02-08 12:30'),
            end: end,
            organizer: {
              email: 'owner@test.com'
            },
            attendees: [{
              email: 'owner@test.com'
            }]
          });
          initController();
          scope.editedEvent.setOrganizerPartStat('DECLINED');
        });

        describe('when isOrganizer is false', function() {
          beforeEach(function() {
            scope.isOrganizer = false;
          });

          it('should call changeParticipation and broadcast on CAL_EVENTS.EVENT_ATTENDEES_UPDATE', function(done) {
            scope.$on(CAL_EVENTS.EVENT_ATTENDEES_UPDATE, function() {
              expect(scope.calendarOwnerAsAttendee).to.deep.equal({
                email: 'user@test.com',
                partstat: 'ACCEPTED'
              });
              expect(scope.editedEvent.changeParticipation).to.have.been.calledWith('ACCEPTED', ['user@test.com']);

              done();
            });

            scope.editedEvent.changeParticipation = sinon.spy();
            scope.calendarOwnerAsAttendee = {
              email: 'user@test.com'
            };
            scope.changeParticipation('ACCEPTED');
          });
        });

        describe('when calendar owner is event organizer', function() {
          beforeEach(function() {
            session.user = owner;

            scope.calendarOwnerAsAttendee = {
              email: 'owner@test.com'
            };
          });

          it('should modify attendees list and broadcast on CAL_EVENTS.EVENT_ATTENDEES_UPDATE', function(done) {
            scope.$on(CAL_EVENTS.EVENT_ATTENDEES_UPDATE, function() {
              expect(scope.editedEvent.attendees).to.shallowDeepEqual([{
                email: 'owner@test.com',
                partstat: 'ACCEPTED'
              }]);
              expect(scope.calendarOwnerAsAttendee).shallowDeepEqual({
                email: 'owner@test.com',
                partstat: 'ACCEPTED'
              });

              done();
            });

            scope.changeParticipation('ACCEPTED');
          });

          it('should not call broadcast if no change in the status', function(done) {
            const broadcastSpy = sinon.spy();

            scope.$on(CAL_EVENTS.EVENT_ATTENDEES_UPDATE, broadcastSpy);

            scope.editedEvent.changeParticipation = sinon.spy();

            scope.changeParticipation('DECLINED');

            expect(broadcastSpy).to.not.have.been.called;

            done();
          });
        });
      });

      describe('read only recurring event', function() {
        let master, instance, attendeeEmail, attendeeStatus;

        beforeEach(function() {
          master = CalendarShell.fromIncompleteShell({
            path: 'path',
            start: moment('2013-02-08 12:30'),
            end: moment('2013-02-08 13:30'),
            organizer: {
              email: 'owner@test.com'
            },
            attendees: [{
              email: 'owner@test.com'
            }, {
              email: 'user@test.com'
            }],
            rrule: {
              freq: 'DAILY',
              interval: 2,
              count: 3
            }
          });

          instance = master.expand()[0];

          sinon.stub(instance, 'getModifiedMaster').returns($q.when(master));

          calEventServiceMock.changeParticipation = sinon.spy(function() { // eslint-disable-line
            return $q.when({});
          });

          attendeeEmail = 'user@test.com';
          attendeeStatus = 'ACCEPTED';

          scope.event = instance;
          session.user = owner;
          initController();
        });

        it('should call $modal', function() {
          scope.calendarOwnerAsAttendee = {
            email: attendeeEmail
          };
          scope.changeParticipation(attendeeStatus);

          $rootScope.$digest();

          expect($modal).to.have.been.calledWith(sinon.match({
            template: require('./modals/edit-instance-or-series-modal.pug'),
            placement: 'center'
          }));
        });

        it('should change participation on whole series when user choose it', function() {
          scope.calendarOwnerAsAttendee = {
            email: 'user@test.com'
          };
          scope.changeParticipation('ACCEPTED');

          $rootScope.$digest();

          expect($modal).to.have.been.calledWith(sinon.match({
            template: require('./modals/edit-instance-or-series-modal.pug'),
            controller: sinon.match.func.and(sinon.match(function(controller) {
              const $scope = {
                $hide: sinon.spy(),
                $broadcast: sinon.spy()
              };

              controller($scope, attendeeEmail, instance, attendeeStatus);

              $scope.editChoice = 'all';

              $scope.submit();
              $rootScope.$digest();

              expect(instance.getModifiedMaster).to.have.been.calledWith(true);
              expect($scope.$hide).to.have.been.calledOnce;
              expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(master.path, master, owner.emails, attendeeStatus);

              return true;
            })),
            placement: 'center'
          }));
        });

        it('should change participation on one instance when user choose it', function() {
          scope.calendarOwnerAsAttendee = {
            email: 'user@test.com'
          };
          scope.changeParticipation('ACCEPTED');

          $rootScope.$digest();

          expect($modal).to.have.been.calledWith(sinon.match({
            template: require('./modals/edit-instance-or-series-modal.pug'),
            controller: sinon.match.func.and(sinon.match(function(controller) {
              const $scope = {
                $hide: sinon.spy(),
                $broadcast: sinon.spy()
              };

              controller($scope, attendeeEmail, instance, attendeeStatus);

              $scope.editChoice = 'this';

              $scope.submit();
              $rootScope.$digest();

              expect(instance.getModifiedMaster).to.not.have.been.called;
              expect($scope.$hide).to.have.been.calledOnce;
              expect(calEventServiceMock.changeParticipation).to.have.been.calledWith(instance.path, instance, owner.emails, attendeeStatus);

              return true;
            })),
            placement: 'center'
          }));
        });
      });
    });

    describe('The submitSuggestion function', function() {

      it('Should trigger a success toaster when sending worked', function() {
        scope.suggestedEvent = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        const suggestedEvent = scope.suggestedEvent;

        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        initController();

        scope.submitSuggestion();
        scope.$digest();

        expect(calEventServiceMock.sendCounter).to.have.been.calledWith(suggestedEvent);
        expect(notificationFactoryMock.weakInfo).to.have.been.calledWith('Calendar -', 'Your proposal has been sent');
      });

      it('Should trigger an error toaster when sending did not work', function(done) {
        scope.suggestedEvent = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        const suggestedEvent = scope.suggestedEvent;

        calEventServiceMock.sendCounter = sinon.stub().returns($q.reject(new Error('Pouet')));

        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end
        });
        initController();

        scope.submitSuggestion().then(function() {
          expect(calEventServiceMock.sendCounter).to.have.been.calledWith(suggestedEvent);
          expect(notificationFactoryMock.weakError).to.have.been.calledWith('Calendar -', 'An error occurred, please try again');
          done();
        });

        scope.$digest();
      });

    });

    describe('updateAlarm function', function() {
      beforeEach(function() {
        canModifyEventResult = false;
      });

      it('should do nothing if the alarm has not changed', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          title: 'title',
          start: moment('2016-12-08 12:30'),
          end: moment('2016-12-08 13:30'),
          location: 'aLocation',
          etag: '123456',
          path: '/calendars/' + owner._id + '/' + calendarTest.id + '/eventID',
          alarm: {
            trigger: CAL_ALARM_TRIGGER[1].value,
            attendee: 'test@open-paas.org'
          }
        });
        initController();
        calEventServiceMock.modifyEvent = sinon.spy(function() {
          return $q.when();
        });

        scope.editedEvent = scope.event.clone();
        scope.updateAlarm();

        expect(calEventServiceMock.modifyEvent).to.have.not.been.called;
      });

      it('should call calEventService.modifyEvent with updateAlarm when alarm is changed', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          title: 'title',
          path: '/calendars/' + owner._id + '/' + calendarTest.id + '/eventID',
          start: moment('2016-12-08 12:30'),
          end: moment('2016-12-08 13:30'),
          location: 'aLocation',
          etag: '123456',
          alarm: {
            trigger: '-PT1M',
            attendee: 'test@open-paas.org'
          }
        });
        initController();
        scope.editedEvent = scope.event.clone();
        scope.editedEvent.alarm = {
          trigger: '-P2D',
          attendee: 'test@open-paas.org'
        };

        calEventServiceMock.modifyEvent = sinon.spy(function(path, event, oldEvent, etag, onCancel) { // eslint-disable-line
          expect(path).to.equal('/calendars/' + owner._id + '/' + calendarTest.id + '/eventID');
          expect(etag).to.equal('123456');
          expect(event.alarm.trigger.toICALString()).to.equal('-P2D');
          expect(oldEvent.alarm.trigger.toICALString()).to.equal('-PT1M');

          return $q.when();
        });

        scope.updateAlarm();

        expect(calEventServiceMock.modifyEvent).to.have.been.called;
      });
    });

    describe('displayCalMailToAttendeesButton function', function() {
      beforeEach(function() {
        canModifyEventResult = false;
      });

      it('should return true if the event has attendees and it is not in the grace periode and it is an old event', function() {
        calEventUtils.isNew = function() { return false; };
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          organizer: {
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          attendees: [{
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          {
            name: 'attendee1',
            email: 'attendee1@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          }]
        });

        initController();

        expect(scope.displayCalMailToAttendeesButton()).to.be.true;
      });

      it('should return false if the event has no individual attendees', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          gracePeriodTaskId: '0000',
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          organizer: {
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          attendees: [{
            name: 'resource',
            email: 'resource',
            cutype: CAL_ICAL.cutype.resource
          }]
        });

        initController();

        expect(scope.displayCalMailToAttendeesButton()).to.be.false;
      });

      it('should return false if the event is in the grace periode', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          organizer: {
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          attendees: [{
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          {
            name: 'attendee1',
            email: 'attendee1@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          }],
          gracePeriodTaskId: '0000',
          etag: '0000'
        });

        initController();

        expect(scope.displayCalMailToAttendeesButton()).to.be.false;
      });

      it('should return false if the event is a new event(not yet in the calendar)', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: start,
          end: end,
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          organizer: {
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          attendees: [{
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          {
            name: 'attendee1',
            email: 'attendee1@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          }],
          gracePeriodTaskId: '0000'
        });

        initController();

        expect(scope.displayCalMailToAttendeesButton()).to.be.false;
      });

      it('should return false if we have the organizer as the only attendee', function() {
        scope.event = CalendarShell.fromIncompleteShell({
          path: '/calendars/' + owner._id + '/' + calendars[1].id + '/eventID',
          start: start,
          end: end,
          organizer: {
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          },
          attendees: [{
            name: 'organiser',
            email: 'organiser@openpaas.org',
            partstart: 'ACCEPTED',
            cutype: CAL_ICAL.cutype.individual
          }],
          gracePeriodTaskId: '0000'
        });

        initController();

        expect(scope.displayCalMailToAttendeesButton()).to.be.false;
      });
    });

    describe('when adding attendee', function() {

      describe('the onUserAttendeesAdded function', function() {
        let attendee;

        beforeEach(function() {
          attendee = { id: '123123' };
          scope.event = CalendarShell.fromIncompleteShell({
            start: moment('2018-04-30 12:30'),
            end: moment('2018-04-30 13:30')
          });
          initController();
        });

        it('should call calFreebusyService.setFreeBusyStatus', function() {
          scope.onUserAttendeesAdded(attendee);

          expect(calFreebusyService.setFreeBusyStatus).to.have.been.calledWith(attendee, scope.event.start, scope.event.end);
        });
      });

      describe('the onResourceAttendeesAdded function', function() {
        let attendee;

        beforeEach(function() {
          attendee = { id: '123123' };
          scope.event = CalendarShell.fromIncompleteShell({
            start: moment('2018-04-30 12:30'),
            end: moment('2018-04-30 13:30')
          });
          initController();
        });

        it('should call calFreebusyService.setFreeBusyStatus', function() {
          scope.onUserAttendeesAdded(attendee);

          expect(calFreebusyService.setFreeBusyStatus).to.have.been.calledWith(attendee, scope.event.start, scope.event.end);
        });
      });
    });

    describe('The onDateChange function', function() {
      beforeEach(function() {
        scope.event = CalendarShell.fromIncompleteShell({
          start: moment('2018-05-01 10:30'),
          end: moment('2018-05-01 14:30')
        });

        initController();

        scope.newAttendees = [{
          displayName: 'attendee2',
          email: 'user2@test.com',
          partstart: 'ACCEPTED'
        }, {
          displayName: 'attendee3',
          email: 'user3@test.com',
          partstart: 'ACCEPTED'
        }];
      });

      it('should not call freebusy service again when new date is in old date', function() {
        const newDate = {
          start: moment('2018-05-01 10:31'),
          end: moment('2018-05-01 14:29')
        };

        scope.onDateChange(newDate);
        scope.$digest();

        expect(calFreebusyService.setBulkFreeBusyStatus).to.have.been.calledOnce;
      });

      it('should call freebusy service when date is not between old date', function() {
        const newDate = {
          start: moment('2018-05-01 10:29'),
          end: moment('2018-05-01 14:31')
        };

        scope.onDateChange(newDate);
        scope.$digest();

        expect(calFreebusyService.setBulkFreeBusyStatus).to.have.been.calledTwice;
        //expect(calFreebusyService.setBulkFreeBusyStatus).to.have.been.calledWith(sinon.match(function(attendees) {
        //  return attendees.length === 2;
        //}), newDate.start, newDate.end, scope.event);
      });
    });

    describe('the duplicateEvent function', function() {
      const eventSkeleton = {
        start: moment('2018-05-01 10:30'),
        end: moment('2018-05-01 14:30'),
        attendees: [{
          displayName: 'attendee1',
          email: 'user1@test.com',
          partstart: 'ACCEPTED'
        }, {
          displayName: 'attendee2',
          email: 'user1@test.com',
          partstart: 'ACCEPTED'
        }],
        sequence: 2, // A property to ignore when copying
        xOpenpaasVideoconference: undefined // a non defined property
      };

      beforeEach(function() {
        scope.event = CalendarShell.fromIncompleteShell(eventSkeleton);

        initController();
        scope.$digest();
      });

      it('should create a new copy of the event details correctly', function() {
        const shellSpy = sinon.spy(CalendarShell, 'fromIncompleteShell');

        scope.duplicateEvent();

        const copiedEvent = shellSpy.firstCall.args[0];

        expect(CalendarShell.fromIncompleteShell).to.have.been.called;
        // Should ignore properties that cannot be edited in the form.
        expect(copiedEvent.sequence).to.be.undefined;
        // Should ignore properties with undefined values
        expect(copiedEvent.xOpenpaasVideoconference).to.be.undefined;
      });

      it('should generate a new video conference link if the original event had one', function() {
        scope.editedEvent = CalendarShell.fromIncompleteShell({
          ...eventSkeleton,
          xOpenpaasVideoconference: 'SOMETHING' // an event with a video conference link
        });

        scope.duplicateEvent();

        expect(VideoConfConfigurationServiceMock.getOpenPaasVideoconferenceAppUrl).to.have.been.called;
      });

      it('should not generate a new video conference link if the original event didn\'t have one', function() {
        scope.editedEvent = CalendarShell.fromIncompleteShell(eventSkeleton);

        scope.duplicateEvent();

        expect(VideoConfConfigurationServiceMock.getOpenPaasVideoconferenceAppUrl).to.not.have.been.called;
      });

      it('should close the previous event form and open a new event form after a brief delay', function() {
        scope.cancel = sinon.spy();
        scope.duplicateEvent();
        $timeout.flush();

        expect(scope.cancel).to.have.been.called;
        expect(calOpenEventFormMock).to.have.been.called;
      });

      it('should reset the participation status for the attendees', function() {
        const shellSpy = sinon.spy(CalendarShell, 'fromIncompleteShell');

        scope.duplicateEvent();

        const copiedEvent = shellSpy.firstCall.args[0];

        copiedEvent.attendees.map(attendee => {
          expect(attendee.partstat).to.eq('NEEDS-ACTION');
        });
      });
    });
  });
});
