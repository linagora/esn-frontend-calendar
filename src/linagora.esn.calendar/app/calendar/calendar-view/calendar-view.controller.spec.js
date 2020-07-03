'use strict';

/* global chai, sinon, _: false */

var expect = chai.expect;

describe('The calendarViewController', function() {
  var event; // eslint-disable-line
  var fullCalendarSpy;
  var createCalendarSpy;
  var self;

  function getDateOnlyMoment(date) {
    var dateOnlyMoment = self.calMoment(date);
    dateOnlyMoment.hasTime = function() { return false; };

    return dateOnlyMoment;
  }

  beforeEach(function() {
    self = this;
    event = {};
    fullCalendarSpy = sinon.spy();
    createCalendarSpy = sinon.spy();

    this.calOpenEventFormMock = sinon.spy();

    this.calendarUtilsMock = {
      getNewStartDate: function() {
        return self.calMoment('2013-02-08 09:30');
      },
      getNewEndDate: function() {
        return self.calMoment('2013-02-08 10:30');
      }
    };

    this.elementScrollServiceMock = {
      scrollToTop: sinon.spy()
    };

    this.calCachedEventSourceMock = {
      wrapEventSource: sinon.spy(function(id, eventSource) { // eslint-disable-line
        return eventSource;
      }),
      resetCache: sinon.spy(),
      registerUpdate: sinon.spy(),
      registerDelete: sinon.spy()
    };

    this.calMasterEventCacheMock = {
      save: sinon.spy(),
      get: sinon.spy(),
      remove: sinon.spy()
    };

    this.CalendarShellConstMock = sinon.spy(function(vcalendar, event) { // eslint-disable-line
      this.etag = event.etag;
      this.path = event.path;
      this.end = self.calMoment();
      this.clone = function() {
        return this;
      };
    });

    this.calendarVisibilityServiceMock = {
      isHidden: sinon.spy(function() {
        return self.$q.when(false);
      })
    };

    this.CalendarShellMock = function() {
      return self.CalendarShellConstMock.apply(this, arguments);
    };

    this.CalendarShellMock.from = sinon.spy(function(event, extendedProp) {
      return angular.extend({}, event, extendedProp);
    });

    this.CalendarShellMock.fromIncompleteShell = sinon.stub.returnsArg(0);

    this.renderSpy = sinon.spy();
    this.calFullCalendarRenderEventService = sinon.spy(function() {
      return self.renderSpy;
    });

    this.calendars = [{
      href: 'href',
      uniqueId: 'id',
      color: 'color',
      getUniqueId: function() {
        return 'uniqueId1';
      }
    }, {
      href: 'href2',
      uniqueId: 'id2',
      color: 'color2',
      getUniqueId: function() {
        return 'uniqueId2';
      }
    }];

    this.calEventServiceMock = {
      checkAndUpdateEvent: sinon.stub(),
      createEvent: function() {
        return $q.when({});
      },
      modifyEvent: sinon.spy(function(path, e) { // eslint-disable-line
        event = e;

        return $q.when();
      })
    };

    this.calendarServiceMock = {
      calendarUniqueId: '1234',
      listPersonalAndAcceptedDelegationCalendars: function() {
        return $q.when(self.calendars);
      },
      createCalendar: function() {
        createCalendarSpy();

        return $q.when();
      }
    };

    this.calendarCurrentViewMock = {
      set: angular.noop,
      get: angular.identity.bind(null, {})
    };

    this.calendar = {
      fullCalendar: fullCalendarSpy,
      offset: function() {
        return {
          top: 1
        };
      }
    };

    this.gracePeriodService = {};
    this.userMock = {};
    this.calEventUtilsMock = {
      setBackgroundColor: sinon.spy(angular.identity)
    };

    this.calendarEventEmitterMock = {
      fullcalendar: {
        emitModifiedEvent: sinon.spy(),
        emitRemovedEvent: sinon.spy()
      }
    };

    this.usSpinnerServiceMock = {
      spin: sinon.spy(),
      stop: sinon.spy()
    };

    this.esnDatetimeServiceMock = {
      updateObjectToUserTimeZone: sinon.stub().returnsArg(0),
      updateObjectToBrowserTimeZone: sinon.stub().returnsArg(0)
    };

    module('esn.calendar');
    module(function($provide) {
      $provide.decorator('calendarUtils', function($delegate) {
        return angular.extend($delegate, self.calendarUtilsMock);
      });
      $provide.value('elementScrollService', self.elementScrollServiceMock);
      $provide.value('calOpenEventForm', self.calOpenEventFormMock);
      $provide.value('calEventService', self.calEventServiceMock);
      $provide.value('calendarService', self.calendarServiceMock);
      $provide.value('gracePeriodService', self.gracePeriodService);
      $provide.value('calEventUtils', self.calEventUtilsMock);
      $provide.value('user', self.userMock);
      $provide.value('calCachedEventSource', self.calCachedEventSourceMock);
      $provide.value('calendarCurrentView', self.calendarCurrentViewMock);
      $provide.value('calendarEventEmitter', self.calendarEventEmitterMock);
      $provide.value('CalendarShell', self.CalendarShellMock);
      $provide.value('calMasterEventCache', self.calMasterEventCacheMock);
      $provide.value('calendarVisibilityService', self.calendarVisibilityServiceMock);
      $provide.value('usSpinnerService', self.usSpinnerServiceMock);
      $provide.value('calCachedEventCache', self.calCachedEventSourceMock);
      $provide.value('calFullCalendarRenderEventService', self.calFullCalendarRenderEventService);
      $provide.value('esnDatetimeService', self.esnDatetimeServiceMock);
      $provide.factory('calendarEventSource', function() {
        return function() {
          return [{
            title: 'RealTest',
            location: 'Paris',
            description: 'description!',
            allDay: false,
            start: new Date(),
            attendeesPerPartstat: {
              'NEEDS-ACTION': []
            }
          }];
        };
      });
      $provide.constant('CAL_MAX_CALENDAR_RESIZE_HEIGHT', 10);
    });
  });

  beforeEach(inject(function(
    $controller,
    $rootScope,
    $timeout,
    $window,
    CAL_UI_CONFIG,
    moment,
    CalendarShell,
    calMoment,
    CAL_EVENTS,
    calDefaultValue,
    calEventUtils,
    elementScrollService,
    esnDatetimeService,
    $q,
    CAL_SPINNER_TIMEOUT_DURATION) {
    this.rootScope = $rootScope;
    this.scope = $rootScope.$new();
    this.controller = $controller;
    this.$q = $q;
    this.$timeout = $timeout;
    this.$window = $window;
    this.calMoment = calMoment;
    this.calDefaultValue = calDefaultValue;
    this.calEventUtils = calEventUtils;
    this.esnDatetimeService = esnDatetimeService;
    this.elementScrollService = elementScrollService;
    this.CalendarShell = CalendarShell;
    this.moment = moment;
    this.CAL_UI_CONFIG = CAL_UI_CONFIG;
    this.CAL_EVENTS = CAL_EVENTS;
    this.CAL_SPINNER_TIMEOUT_DURATION = CAL_SPINNER_TIMEOUT_DURATION;
  }));

  beforeEach(function() {
    this.scope.uiConfig = this.CAL_UI_CONFIG;
    this.scope.calendarHomeId = 'calendarId';
    this.calDefaultValue.set('calendarId', 'calendarId');

  });

  afterEach(function() {
    this.gracePeriodService.flushAllTasks = function() {};
    this.scope.$destroy();
  });

  it('should scroll to top when calling calendarViewController)', function() {
    this.gracePeriodService.flushAllTasks = sinon.spy();
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.$destroy();

    expect(this.elementScrollService.scrollToTop).to.have.been.called;
  });

  it('should gracePeriodService.flushAllTasks $on(\'$destroy\')', function() {
    this.gracePeriodService.flushAllTasks = sinon.spy();
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.$destroy();
    expect(this.gracePeriodService.flushAllTasks).to.have.been.called;
  });

  it('should register gracePeriodService.flushAllTasks on(\'beforeunload\')', function() {
    this.gracePeriodService.flushAllTasks = 'aHandler';
    var aEvent = null;
    var handler = null;

    this.$window.addEventListener = function(evt, hdlr) {
      aEvent = evt;
      handler = hdlr;
    };
    this.controller('calendarViewController', {$scope: this.scope});
    expect(aEvent).to.equal('beforeunload');
    expect(handler).to.equal('aHandler');
  });

  it('should calCachedEventSource.resetCache $on(\'$destroy\')', function() {
    this.gracePeriodService.flushAllTasks = angular.noop;
    this.calCachedEventSourceMock.resetChange = sinon.spy();
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.$destroy();
    expect(this.calCachedEventSourceMock.resetCache).to.have.been.called;
  });

  it('should be created and its scope initialized', function() {
    this.controller('calendarViewController', {$scope: this.scope});

    expect(this.scope.uiConfig.calendar.eventRender).to.be.a.function;
    expect(this.scope.uiConfig.calendar.eventAfterAllRender).to.equal(this.scope.resizeCalendarHeight);
  });

  describe('The uiConfig.calendar.eventRender function', function() {
    it('should call calFullCalendarRenderEventService with the event calendar', function() {
      var event = {calendarUniqueId: this.calendars[0].getUniqueId()};
      var element = {};
      var view = {};

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.$digest();
      this.scope.uiConfig.calendar.eventRender(event, element, view);

      expect(this.calFullCalendarRenderEventService).to.have.been.calledWith(this.calendars[0]);
    });
  });

  describe('The uiConfig.calendar.select function', function() {
    it('should open a new event form with start and end dates from the selected time box', function() {
      var start = this.calMoment('2016-01-01 09:00');
      var end = this.calMoment('2016-01-01 10:00');

      this.calendarUtilsMock.getDateOnCalendarSelect = function() {
        return { start: start, end: end };
      };

      this.scope.calendarHomeId = 'calendarHomeId';
      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.$digest();
      this.scope.uiConfig.calendar.select(start, end);

      var event = {
        start: start,
        end: end
      };

      expect(this.calOpenEventFormMock).to.have.been.calledWith(this.scope.calendarHomeId, sinon.match(event));
    });

    it('should strip time for "All day" events and open a new event form with start and end dates from the selected time box', function() {
      var start = getDateOnlyMoment('2016-01-01');
      var end = getDateOnlyMoment('2016-01-02');

      var firstTimeStrip = true;
      this.calEventUtils.stripTimeWithTz = function(calMomentDate) {
        expect(calMomentDate.isSame(firstTimeStrip ? start : end)).to.be.true;
        firstTimeStrip = false;

        return calMomentDate;
      };

      this.calendarUtilsMock.getDateOnCalendarSelect = function() {
        return { start: start, end: end };
      };

      this.scope.calendarHomeId = 'calendarHomeId';
      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.$digest();
      this.scope.uiConfig.calendar.select(start, end);

      var event = {
        start: start,
        end: end
      };

      expect(this.calOpenEventFormMock).to.have.been.calledWith(this.scope.calendarHomeId, sinon.match(event));
    });
  });

  function testRefetchEvent(nameOfTheTest, calendar_events, calendarSpyCalledWith) {
    it(nameOfTheTest, function() {
      this.controller('calendarViewController', {$scope: this.scope});
      this.rootScope.$broadcast(this.CAL_EVENTS[calendar_events]);

      this.scope.calendarReady(this.calendar);
      this.scope.$digest();
      expect(fullCalendarSpy).to.have.been.calledWith(calendarSpyCalledWith || 'refetchEvents');
    });
  }

  describe('the initialization', function() {
    it('should properly initialize $scope.calendars', function() {
      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.$digest();

      expect(this.scope.calendars).to.deep.equal(this.calendars);
    });
  });

  describe('The CAL_EVENTS.ITEM_MODIFICATION listener', function() {
    testRefetchEvent('should refresh the calendar', 'ITEM_MODIFICATION');
  });

  describe('The CAL_EVENTS.ITEM_ADD listener', function() {
    testRefetchEvent('should refresh the calendar', 'ITEM_ADD');
  });

  describe('The CAL_EVENTS.ITEM_REMOVE listener', function() {
    testRefetchEvent('should refresh the calendar', 'ITEM_REMOVE');
  });

  describe('The CAL_EVENTS.CALENDAR_UNSELECT listener', function() {
    testRefetchEvent('should unselect the calendar', 'CALENDAR_UNSELECT', 'unselect');
  });

  describe('The CAL_EVENTS.CALENDARS.UPDATE listener', function() {
    it('should update $scope.calendars correctly', function() {
      var id1 = 1;
      var id2 = 2;
      var data = 'data';

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.calendars = [{uniqueId: id1, getUniqueId: function() {return id1;}}, {uniqueId: id2, getUniqueId: function() {return id2;}}];
      var newCal = {uniqueId: id2, data: data, getUniqueId: function() {return id2;}};

      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.UPDATE, newCal);
      expect(this.scope.calendars).to.shallowDeepEqual([{uniqueId: id1}, {uniqueId: id2, data: data}]);
    });

    it('should force redraw the events if calendar color is defined and changed', function() {
      var uniqueId = this.calendars[1].getUniqueId();
      var updatedCalendar = {
        uniqueId: this.calendars[1].uniqueId,
        data: 'data',
        color: this.calendars[1].color + 'anothercolor',
        getUniqueId: function() {
          return uniqueId;
        }
      };

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.calendarReady(this.calendar);
      this.scope.calendars = this.calendars;
      this.scope.eventSourcesMap = {};
      this.scope.eventSourcesMap[this.calendars[0].getUniqueId()] = this.calendars[0];
      this.scope.eventSourcesMap[this.calendars[1].getUniqueId()] = this.calendars[1];
      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.UPDATE, updatedCalendar);
      this.scope.$digest();

      expect(this.scope.calendars).to.shallowDeepEqual([this.calendars[0], {uniqueId: updatedCalendar.uniqueId, color: updatedCalendar.color}]);
      expect(this.scope.eventSourcesMap[updatedCalendar.getUniqueId()].backgroundColor).to.equal(updatedCalendar.color);
      expect(fullCalendarSpy).to.have.been.calledWith('removeEventSource', sinon.match.has('uniqueId', updatedCalendar.uniqueId));
      expect(fullCalendarSpy).to.have.been.calledWith('addEventSource', sinon.match.has('uniqueId', updatedCalendar.uniqueId));
    });
  });

  describe('The CAL_EVENTS.CALENDAR_REFRESH listener', function() {
    testRefetchEvent('should refresh the calendar', 'CALENDAR_REFRESH');
  });

  describe('The CAL_EVENTS.CALENDARS.REMOVE listener', function() {
    it('should remove the calendar on $scope.calendars correctly', function() {
      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.calendars = [{uniqueId: 1, getUniqueId: function() {return 1;}}, {uniqueId: 2, getUniqueId: function() {return 2;}}];
      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.REMOVE, {uniqueId: 2, getUniqueId: function() {return 2;}});
      expect(this.scope.calendars).to.shallowDeepEqual([{uniqueId: 1}]);
    });

    it('should remove the corresponding source map correctly', function() {
      var id = 'calendarUniqueId';
      var source = {
        backgroundColor: 'black',
        events: function() {
          return [];
        }
      };

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.calendarReady(this.calendar);
      this.scope.$digest();
      this.scope.eventSourcesMap = {calendarUniqueId: source};
      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.REMOVE, {uniqueId: id, getUniqueId: function() {return id;}});
      this.scope.calendarReady(this.calendar);
      this.scope.$digest();

      expect(this.scope.eventSourcesMap['2']).to.be.undefined;
      expect(fullCalendarSpy).to.have.been.calledWith('removeEventSource', sinon.match.same(source));
    });
  });

  describe('The CAL_EVENTS.CALENDARS.ADD listener', function() {
    it('should not add calendar to scope and eventSources if already present', function() {
      var id = 'uniqueId1';
      var calendar = {
        href: 'href',
        uniqueId: 'id',
        color: 'color',
        getUniqueId: function() {
          return id;
        }
      };
      var source = 'source';
      var wrappedSource = 'source';
      var calendarEventSourceMock = sinon.stub().returns(source);

      this.calCachedEventSourceMock.wrapEventSource = sinon.stub().returns(wrappedSource);
      this.controller('calendarViewController', {
        $scope: this.scope,
        calendarEventSource: calendarEventSourceMock
      });
      this.scope.calendarReady(this.calendar);
      this.scope.$digest();

      var expectedScopeCalendars = angular.copy(this.scope.calendars);
      var expectedScopeEventSourcesMap = angular.copy(this.scope.eventSourcesMap);

      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.ADD, calendar);

      this.scope.$digest();

      expect(this.scope.calendars).to.deep.equals(expectedScopeCalendars);
      expect(this.scope.eventSourcesMap).to.deep.equals(expectedScopeEventSourcesMap);

      // Should be called twice when controller inits
      expect(fullCalendarSpy).to.have.been.calledTwice;
    });

    it('should add calendar to scope and eventSources is not present', function() {
      var id = 'uniqueId3';
      var calendar = {
        href: 'href',
        uniqueId: 'id3',
        color: 'color',
        getUniqueId: function() {
          return id;
        }
      };
      var source = 'source';
      var wrappedSource = 'source';
      var calendarEventSourceMock = sinon.stub().returns(source);

      this.calCachedEventSourceMock.wrapEventSource = sinon.stub().returns(wrappedSource);
      this.controller('calendarViewController', {
        $scope: this.scope,
        calendarEventSource: calendarEventSourceMock
      });
      this.scope.calendarReady(this.calendar);
      this.scope.$digest();

      var expectedScopeCalendars = angular.copy(this.scope.calendars);
      var expectedScopeEventSourcesMap = angular.copy(this.scope.eventSourcesMap);

      expectedScopeCalendars.push(calendar);

      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.ADD, calendar);

      this.scope.$digest();

      expect(this.scope.calendars).to.deep.equals(expectedScopeCalendars);
      expect(this.scope.eventSourcesMap).to.not.deep.equals(expectedScopeEventSourcesMap);

      expect(calendarEventSourceMock).to.have.been.calledWith(calendar, this.scope.displayCalendarError);
      expect(this.calCachedEventSourceMock.wrapEventSource).to.have.been.calledWith(calendar, source);

      expect(this.scope.calendars[2]).to.deep.equals(calendar);
      expect(this.scope.eventSourcesMap[id]).to.deep.equals({
        events: wrappedSource,
        backgroundColor: 'color'
      });

      expect(fullCalendarSpy).to.have.been.calledWith('addEventSource', this.scope.eventSourcesMap[id]);
      // Should be called 2 times when controller inits and once when adding calendar
      expect(fullCalendarSpy).to.have.been.calledThrice;
    });
  });

  describe('The CAL_EVENTS.CALENDARS.TOGGLE_VIEW_MODE listener', function() {
    it('should change the view mode of the calendar', function() {
      this.controller('calendarViewController', {$scope: this.scope});
      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.TOGGLE_VIEW_MODE, 'viewType');

      this.scope.calendarReady(this.calendar);
      this.scope.$digest();
      expect(fullCalendarSpy).to.have.been.calledWith('changeView', 'viewType');
    });
  });

  describe('The CAL_EVENTS.CALENDARS.CALENDAR_TODAY listener', function() {
    it('should change the view mode of the calendar', function() {
      this.controller('calendarViewController', {$scope: this.scope});
      this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.TODAY, 'viewType');

      this.scope.calendarReady(this.calendar);
      this.scope.$digest();
      expect(fullCalendarSpy).to.have.been.calledWith('today');
    });
  });

  it('should call fullCalendar next on swipeRight', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.calendarReady(this.calendar);
    this.scope.swipeRight();
    this.scope.$digest();
    expect(fullCalendarSpy).to.have.been.calledWith('prev');
  });

  it('should call fullCalendar next on swipeLeft', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.calendarReady(this.calendar);
    this.scope.swipeLeft();
    this.scope.$digest();
    expect(fullCalendarSpy).to.have.been.calledWith('next');
  });

  it('should init list calendars and list of eventsSourceMap', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.calendarReady(this.calendar);
    this.scope.$digest();
    expect(this.scope.calendars.length).to.equal(2);
    expect(this.scope.calendars[0].href).to.equal('href');
    expect(this.scope.calendars[0].color).to.equal('color');
    expect(this.scope.calendars[1].href).to.equal('href2');
    expect(this.scope.calendars[1].color).to.equal('color2');
    expect(this.scope.eventSourcesMap.uniqueId1.backgroundColor).to.equal('color');
    expect(this.scope.eventSourcesMap.uniqueId2.backgroundColor).to.equal('color2');
    expect(this.scope.eventSourcesMap.uniqueId1.events).to.be.a('Array');
    expect(this.scope.eventSourcesMap.uniqueId2.events).to.be.a('Array');
  });

  it('should add source for each calendar which is not hidden', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.calendarVisibilityServiceMock.isHidden = sinon.stub();
    this.calendarVisibilityServiceMock.isHidden
      .onFirstCall()
      .returns(this.$q.when(false));
    this.calendarVisibilityServiceMock.isHidden
      .onSecondCall()
      .returns(this.$q.when(true));

    this.scope.calendarReady(this.calendar);
    this.scope.$digest();
    expect(fullCalendarSpy).to.have.been.calledWith('addEventSource', this.scope.eventSourcesMap[this.calendars[0].getUniqueId()]);
    expect(fullCalendarSpy).to.not.have.been.calledWith('addEventSource', this.scope.eventSourcesMap[this.calendars[1].getUniqueId()]);
    expect(fullCalendarSpy).to.have.been.calledOnce;
  });

  it('should have wrap each calendar with calCachedEventSource.wrapEventSource', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.calendarReady(this.calendar);
    this.scope.$digest();
    expect(this.calCachedEventSourceMock.wrapEventSource).to.have.been.calledTwice;
    expect(this.calCachedEventSourceMock.wrapEventSource).to.have.been.calledWithExactly(this.calendars[0], sinon.match.array);

    expect(this.calCachedEventSourceMock.wrapEventSource).to.have.been.calledWithExactly(this.calendars[1], sinon.match.array);
  });

  it('should emit addEventSource on CAL_EVENTS.CALENDARS.TOGGLE_VIEW and eventData.hidden is false', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.calendarReady(this.calendar);
    this.scope.$digest();
    this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {hidden: false, calendarUniqueId: 'calendarUniqueId' });
    this.scope.$digest();

    expect(this.calendar.fullCalendar).to.have.been.calledWith('addEventSource');
  });

  it('should emit removeEventSource on CAL_EVENTS.CALENDARS.TOGGLE_VIEW and eventData.hidden is true', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.calendarReady(this.calendar);
    this.rootScope.$broadcast(this.CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {hidden: true, calendar: {}});
    this.scope.$digest();

    expect(this.calendar.fullCalendar).to.have.been.calledWith('removeEventSource');
  });

  it('should change view on VIEW_TRANSLATION only when mobile mini calendar is hidden', function() {
    this.controller('calendarViewController', {$scope: this.scope});

    this.scope.calendarReady(this.calendar);

    var fcMethodMock = {
    };

    this.calendar.fullCalendar = function(action) {
      (fcMethodMock[action] || angular.noop)();
    };

    ['prev', 'next'].forEach(function(action) {
      fcMethodMock[action] = sinon.spy();
      this.rootScope.$broadcast(this.CAL_EVENTS.VIEW_TRANSLATION, action);

      this.rootScope.$broadcast(this.CAL_EVENTS.MINI_CALENDAR.TOGGLE);
      this.rootScope.$broadcast(this.CAL_EVENTS.VIEW_TRANSLATION, action);

      this.rootScope.$broadcast(this.CAL_EVENTS.MINI_CALENDAR.TOGGLE);
      this.rootScope.$broadcast(this.CAL_EVENTS.VIEW_TRANSLATION, action);

      this.scope.$digest();
      expect(fcMethodMock[action]).to.have.been.calleTwice;
    }, this);
  });

  it('should resize the calendar height once when the window is resized', function() {
    this.controller('calendarViewController', {$scope: this.scope});
    this.scope.$digest();

    this.scope.calendarReady(this.calendar);
    this.scope.$digest();

    angular.element(this.$window).resize();
    this.scope.$digest();

    expect(fullCalendarSpy).to.have.been.calledWith('option', 'height', sinon.match.number);
  });

  it('should display an error if calendar events cannot be retrieved', function(done) {

    var calendarEventSourceMock = function(calendarUniqueId, errorCallback) { // eslint-disable-line
      errorCallback(new Error(), 'Can not get calendar events');
    };

    var $alertMock = function(alertObject) {
      expect(alertObject.show).to.be.true;
      expect(alertObject.content).to.equal('Can not get calendar events');
      done();
    };

    this.controller('calendarViewController', {
      $scope: this.scope,
      $alert: $alertMock,
      calendarEventSource: calendarEventSourceMock
    });
    this.scope.$digest();
  });

  it('should restore view from calendarCurrentView during initialization', function() {
    var date = this.calMoment('1953-03-16');

    this.calendarCurrentViewMock.get = sinon.spy(function() {
      return {
        name: 'agendaDay',
        start: date
      };
    });

    this.controller('calendarViewController', {
      $rootScope: this.rootScope,
      $scope: this.scope
    });

    expect(this.calendarCurrentViewMock.get).to.have.been.calledOnce;
    expect(this.scope.uiConfig.calendar.defaultView).to.equals('agendaDay');
    expect(this.scope.uiConfig.calendar.defaultDate).to.equals(date);
  });

  it('should save view with calendarCurrentView when view change', function() {
    var view = {};

    this.calendarCurrentViewMock.set = sinon.spy(function(_view) {
      expect(_view).to.equals(view);
    });

    this.controller('calendarViewController', {
      $rootScope: this.rootScope,
      $scope: this.scope
    });

    this.scope.uiConfig.calendar.viewRender(view);

    expect(this.calendarCurrentViewMock.set).to.have.been.calledOnce;
  });

  describe('the loading function', function() {
    it('should spin the throbber when isLoading is true after CAL_SPINNER_TIMEOUT_DURATION', function(done) {
      var isLoading = true;

      this.controller('calendarViewController', {$scope: this.scope});

      this.scope.uiConfig.calendar.loading(isLoading);
      this.$timeout.flush(this.CAL_SPINNER_TIMEOUT_DURATION - 1);

      expect(this.scope.hideCalendar).to.be.undefined;
      expect(this.usSpinnerServiceMock.spin).to.not.have.been.called;

      this.$timeout.flush(1);

      expect(this.scope.hideCalendar).to.equal(isLoading);
      expect(this.usSpinnerServiceMock.spin).to.have.been.calledOnce;

      done();
    });

    it('should stop the throbber loading and cancel any pending timeout when isLoading is false', function(done) {
      var isLoading = false;
      sinon.spy(this.$timeout, 'cancel');

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.uiConfig.calendar.loading(isLoading);
      this.$timeout.flush();

      expect(this.scope.hideCalendar).to.equal(isLoading);
      expect(this.usSpinnerServiceMock.stop).to.have.been.calledOnce;
      expect(this.$timeout.cancel).to.have.been.called;

      done();
    });
  });

  describe('the eventDropAndResize listener', function() {
    function assertEqualEvents(actualEvent, expectedEvent) {
      return actualEvent.start.isSame(expectedEvent.start) &&
        actualEvent.end.isSame(expectedEvent.end);
    }

    it('should call calendarService.checkAndUpdateEvent with the correct argument if resize', function() {
      var oldEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:00'),
        clone: function() {
          return newEvent; // eslint-disable-line
        }
      };

      var event = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:10'),
        clone: function() {
          return oldEvent;
        }
      };

      var newEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:10'),
        clone: function() {
          return oldEvent;
        }
      };

      this.controller('calendarViewController', {$scope: this.scope});
      var delta = this.calMoment.duration(10, 'minutes');

      this.scope.eventDropAndResize(false, event, delta);
      expect(newEvent.start.isSame(this.calMoment('2016-01-01 09:00'))).to.be.true;
      expect(newEvent.end.isSame(this.calMoment('2016-01-01 10:10'))).to.be.true;
      expect(this.calEventServiceMock.checkAndUpdateEvent).to.have.been.calledWith(newEvent, sinon.match.func, sinon.match.func, sinon.match.func);
    });

    it('should call calendarService.checkAndUpdateEvent with the correct argument if drop', function() {
      var oldEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:00'),
        clone: function() {
          return newEvent; // eslint-disable-line
        }
      };

      var event = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:10'),
        clone: function() {
          return oldEvent;
        }
      };

      var newEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:00'),
        clone: function() {
          return oldEvent;
        }
      };

      var delta = this.calMoment.duration(10, 'minutes');

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.eventDropAndResize(true, event, delta);

      expect(newEvent.start.isSame(this.calMoment('2016-01-01 09:10'))).to.be.true;
      expect(newEvent.end.isSame(this.calMoment('2016-01-01 10:10'))).to.be.true;
      expect(this.calEventServiceMock.checkAndUpdateEvent).to.have.been.calledWith(newEvent, sinon.match.func, sinon.match.func, sinon.match.func);
    });

    it('should call calendarService.checkAndUpdateEvent with correct arguments when dragging and dropping from normal display to all-day display', function() {
      this.calEventUtilsMock.stripTimeWithTz = sinon.stub().returnsArg(0);

      var oldEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:00'),
        clone: function() {
          return _.assign({}, this);
        }
      };

      var event = {
        path: 'aPath',
        etag: 'anEtag',
        allDay: true,
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:00'),
        clone: function() {
          return _.assign({}, oldEvent);
        }
      };

      var delta = this.calMoment.duration(10, 'minutes');

      var newEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: event.start.clone().add(delta),
        end: event.end.clone().add(delta).add(1, 'day')
      };

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.eventDropAndResize(true, event, delta);

      expect(this.calEventUtilsMock.stripTimeWithTz).to.have.been.calledTwice;
      expect(this.calEventServiceMock.checkAndUpdateEvent).to.have.been.calledWith(sinon.match(function(actualNewEvent) {
        return assertEqualEvents(actualNewEvent, newEvent);
      }), sinon.match.func, sinon.match.func, sinon.match.func);
    });

    it('should call calendarService.checkAndUpdateEvent with correct arguments when dragging and dropping from all-day display to normal display', function() {
      this.calEventUtilsMock.stripTimeWithTz = sinon.stub().returnsArg(0);

      var oldEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: getDateOnlyMoment('2016-01-01'),
        end: getDateOnlyMoment('2016-01-02'),
        clone: function() {
          return _.assign({}, this);
        }
      };

      var event = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment('2016-01-01 09:00'),
        end: this.calMoment('2016-01-01 10:00'),
        clone: function() {
          return _.assign({}, oldEvent);
        }
      };

      var delta = this.calMoment.duration(10, 'minutes');

      var newEvent = {
        path: 'aPath',
        etag: 'anEtag',
        start: event.start.clone(),
        end: event.end.clone().endOf('day')
      };

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.eventDropAndResize(true, event, delta);

      expect(this.calEventUtilsMock.stripTimeWithTz).to.have.not.been.called;
      expect(this.calEventServiceMock.checkAndUpdateEvent).to.have.been.calledWith(sinon.match(function(actualNewEvent) {
        return assertEqualEvents(actualNewEvent, newEvent);
      }), sinon.match.func, sinon.match.func, sinon.match.func);
    });

    it('should call calendarService.checkAndUpdateEvent with correct arguments when dragging and dropping within all-day display', function() {
      this.calEventUtilsMock.stripTimeWithTz = sinon.stub().returnsArg(0);

      var oldEvent = {
        path: 'aPath',
        etag: 'anEtag',
        allDay: true,
        full24HoursDay: true,
        start: getDateOnlyMoment('2016-01-01'),
        end: getDateOnlyMoment('2016-01-02'),
        clone: function() {
          return _.assign({}, this);
        }
      };

      var delta = this.calMoment.duration(2, 'days');

      var event = {
        path: 'aPath',
        etag: 'anEtag',
        allDay: true,
        full24HoursDay: true,
        start: getDateOnlyMoment(oldEvent.start.clone().add(delta)),
        end: getDateOnlyMoment(oldEvent.end.clone().add(delta)),
        clone: function() {
          return _.assign({}, oldEvent);
        }
      };

      var newEvent = {
        path: 'aPath',
        etag: 'anEtag',
        allDay: true,
        full24HoursDay: true,
        start: event.start.clone(),
        end: event.end.clone()
      };

      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.eventDropAndResize(true, event, delta);

      expect(this.calEventUtilsMock.stripTimeWithTz).to.have.been.calledTwice;
      expect(this.calEventServiceMock.checkAndUpdateEvent).to.have.been.calledWith(sinon.match(function(actualNewEvent) {
        return assertEqualEvents(actualNewEvent, newEvent);
      }), sinon.match.func, sinon.match.func, sinon.match.func);
    });

    it('should send a CAL_EVENTS.REVERT_MODIFICATION with the event after calling fullcalendar revert when the drap and drop if reverted', function(done) {
      var event = {
        path: 'aPath',
        etag: 'anEtag',
        start: this.calMoment(),
        end: this.calMoment(),
        clone: function() {
          return event;
        }
      };

      this.scope.event = event;

      var oldEvent;

      this.rootScope.$on(this.CAL_EVENTS.REVERT_MODIFICATION, function(angularEvent, event) {
        expect(event).to.equal(oldEvent);
        done();
      });

      this.calEventServiceMock.checkAndUpdateEvent = function(event, updateFn, editFn, cancelFn) {
        oldEvent = event;
        cancelFn();

        return $q.when({});
      };

      this.controller('calendarViewController', {$scope: this.scope});
      var fcRevert = sinon.spy();

      this.scope.eventDropAndResize(false, event, this.calMoment.duration(10), fcRevert);
      expect(this.calEventUtilsMock.setBackgroundColor).to.have.been.calledWith(event, this.calendars);
      expect(fcRevert).to.have.been.calledOnce;
    });

    it('should call calendarService.checkAndUpdateEvent with a built path if scope.event.path does not exist', function(done) {
      var event = {
        etag: 'anEtag',
        start: this.calMoment(),
        end: this.calMoment(),
        clone: function() {
          return event;
        }
      };
      var calendarHomeId = 'calendarHomeId';

      this.scope.calendarHomeId = calendarHomeId;
      this.scope.event = event;
      this.calEventServiceMock.checkAndUpdateEvent = function(event) {
        expect(event.path).to.equal('/calendars/' + calendarHomeId + '/' + self.calDefaultValue.get('calendarId'));
        done();
      };
      this.controller('calendarViewController', {$scope: this.scope});
      this.scope.eventDropAndResize(false, event, this.calMoment.duration(10, 'seconds'));
    });

    it('should broadcast CAL_EVENTS.HOME_CALENDAR_VIEW_CHANGE when the view change', function(done) {
      this.controller('calendarViewController', {$scope: this.scope});

      var event = this.CalendarShell.fromIncompleteShell({
        etag: 'anEtag'
      });

      this.rootScope.$on(this.CAL_EVENTS.HOME_CALENDAR_VIEW_CHANGE, function(angularEvent, _event) { // eslint-disable-line
        expect(_event).to.equals(event);
        done();
      });

      this.scope.uiConfig.calendar.viewRender(event);

    });

    it('should receive CAL_EVENTS.MINI_CALENDAR.DATE_CHANGE and change view if needed', function(done) {
      this.controller('calendarViewController', {$scope: this.scope});
      var date = this.calMoment('2015-01-13');
      var first = true;

      self = this;
      var spy = this.calendar.fullCalendar = sinon.spy(function(name, newDate) {
        if (name === 'getView') {
          if (first) {
            first = false;
            self.rootScope.$broadcast(self.CAL_EVENTS.MINI_CALENDAR.DATE_CHANGE, date);
          }

          return {
            start: self.calMoment('2015-01-01'),
            end: self.calMoment('2015-01-10')
          };
        }
        if (name === 'gotoDate') {
          expect(newDate.isSame(date, 'day')).to.be.true;
          expect(spy).to.be.calledTwice;
          done();
        }
      });

      this.rootScope.$broadcast(this.CAL_EVENTS.MINI_CALENDAR.DATE_CHANGE, this.calMoment('2015-01-13'));
      this.scope.calendarReady(this.calendar);
      this.scope.$digest();
    });
  });

  describe('the eventClick', function() {
    it('should open form with the current calendarHomeId and clonedEvent', function() {
      var clonedEvent = {};
      var event = {
        clone: sinon.spy(function() {
          return clonedEvent;
        })
      };

      this.controller('calendarViewController', {$scope: this.scope});

      this.scope.eventClick(event);

      expect(this.calOpenEventFormMock).to.have.been.calledWith(this.scope.calendarHomeId, clonedEvent);
      expect(event.clone).to.have.been.calledWith();
    });
  });

  describe('the mouseScrollEvent', function() {
    it('should call fullCalendar next on scrollUp when currentView is equal to month', function() {
      this.controller('calendarViewController', {$scope: this.scope});

      this.scope.prevented = true;
      this.scope.calendarReady(this.calendar);
      this.scope.showNextMonth();
      this.scope.$digest();

      expect(fullCalendarSpy).to.have.been.calledWith('next');
    });

    it('should call fullCalendar prev on scrollUp when currentView is equal to month', function() {
      this.controller('calendarViewController', {$scope: this.scope});

      this.scope.prevented = true;
      this.scope.calendarReady(this.calendar);
      this.scope.showPrevMonth();
      this.scope.$digest();

      expect(fullCalendarSpy).to.have.been.calledWith('prev');
    });

    it('should not call fullCalendar next on scrollUp when currentView is not equal to month', function() {
      this.controller('calendarViewController', {$scope: this.scope});

      this.scope.prevented = false;
      this.scope.calendarReady(this.calendar);
      this.scope.showNextMonth();
      this.scope.$digest();

      expect(fullCalendarSpy).to.have.been.notCalled;
    });

    it('should not call fullCalendar prev on scrollUp when currentView is not equal to month', function() {
      this.controller('calendarViewController', {$scope: this.scope});

      this.scope.prevented = false;
      this.scope.calendarReady(this.calendar);
      this.scope.showPrevMonth();
      this.scope.$digest();

      expect(fullCalendarSpy).to.have.been.notCalled;
    });
  });
});
