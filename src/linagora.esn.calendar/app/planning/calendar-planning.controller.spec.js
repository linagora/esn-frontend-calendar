'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalCalendarPlanningController', function() {
  var $rootScope, $controller;
  var calFullUiConfiguration;
  var CAL_UI_CONFIG;
  let testHiddenCalendars, $timeout, calFullCalendarPlanningRenderEventServiceMock;
  let CAL_EVENTS, calendar;
  const self = this;

  beforeEach(function() {
    testHiddenCalendars = [
      '/path/to/.json',
      '/calendars/123.json'
    ];

    calendar = {
      fullCalendar: sinon.spy()
    };
    self.calendars = [{
      href: 'href',
      uniqueId: 'id',
      color: 'color',
      getUniqueId: function() {
        return 'uniqueId1';
      }
    }];

    calFullCalendarPlanningRenderEventServiceMock = sinon.stub().returns(function() {});

    self.calendarVisibilityServiceMock = {
      getHiddenCalendars: sinon.stub().returns($q.when(testHiddenCalendars)),
      isHidden: function() {
        return ($q.when(false));
      }
    };
    self.calendarServiceMock = {
      listPersonalAndAcceptedDelegationCalendars: function() {

        return ($q.when(self.calendars));
      }
    };

    angular.mock.module('esn.calendar');
    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');

    angular.mock.module(function($provide) {
      $provide.value('calendarVisibilityService', self.calendarVisibilityServiceMock);
      $provide.value('calendarService', self.calendarServiceMock);
      $provide.value('calFullCalendarPlanningRenderEventService', calFullCalendarPlanningRenderEventServiceMock);
    });

    inject(function(
      _$rootScope_,
      _$controller_,
      _$timeout_,
      _calFullUiConfiguration_,
      _CAL_UI_CONFIG_,
      _CAL_EVENTS_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      calFullUiConfiguration = _calFullUiConfiguration_;
      CAL_UI_CONFIG = _CAL_UI_CONFIG_;
      $timeout = _$timeout_;
      CAL_EVENTS = _CAL_EVENTS_;

    });
  });

  function initController($scope) {
    $scope = $scope || $rootScope.$new();

    var controller = $controller('CalCalendarPlanningController', { $scope: $scope });

    controller.$onInit();
    $scope.$digest();

    return controller;
  }

  describe('The $onInit function', function() {
    it('should set timeFormat follow the user time format configuration', function() {
      var timeFormat = 'abc';

      calFullUiConfiguration.configureTimeFormatForCalendar = sinon.stub().returns({
        calendar: {
          timeFormat: timeFormat
        }
      });

      var controller = initController();

      expect(controller.uiConfig.timeFormat).to.equal(timeFormat);
      expect(calFullUiConfiguration.configureTimeFormatForCalendar).to.have.been.calledWith(CAL_UI_CONFIG);
    });

    it('should remove calendar\'s event if it is hidden', function() {

      const ctrl = initController();

      ctrl.calendarReady(calendar);
      $rootScope.$digest();
      $timeout.flush();

      expect(calendar.fullCalendar.args[0][0]).to.equal('removeEventSource');
      expect(calendar.fullCalendar.args[1][0]).to.equal('addEventSource');
    });

    it('should fetch the currently hidden calendars', function() {
      const ctrl = initController();
      const expectedHiddenCalendars = {
        '/path/to/.json': true,
        '/calendars/123.json': true
      };

      $timeout.flush();

      expect(self.calendarVisibilityServiceMock.getHiddenCalendars).to.have.been.called;

      setTimeout(() => { // the test won't wait for the object population without it.
        expect(ctrl.hiddenCalendars).to.eql(expectedHiddenCalendars);
      }, 200);
    });
  });

  describe('the eventRender method', function() {
    it('should not render events from hidden calendars', function() {
      const ctrl = initController();

      $timeout.flush();

      ctrl.hiddenCalendars = {
        'calendars/123.json': true
      };

      ctrl.uiConfig.eventRender({ calendarUniqueId: 'calendars/123.json' }, {}, {});
      expect(calFullCalendarPlanningRenderEventServiceMock).to.not.have.been.called;
    });

    it('should render events from shown calendars', function() {
      const ctrl = initController();

      $timeout.flush();

      ctrl.hiddenCalendars = {
        'calendars/123.json': true
      };

      ctrl.uiConfig.eventRender({ calendarUniqueId: 'calendars/456.json' }, {}, {});
      expect(calFullCalendarPlanningRenderEventServiceMock).to.have.been.called;
    });
  });

  describe('the onCalendarToggle handler', function() {
    it('should remove the hidden calendar from the eventSourcesMap and mark it as hidden', function() {
      const scope = $rootScope.$new();

      const ctrl = initController(scope);

      $rootScope.$digest();

      ctrl.calendarReady(calendar);

      $rootScope.$broadcast(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {
        calendarUniqueId: 'calendars/456.json',
        hidden: true
      });

      $timeout.flush();

      expect(calendar.fullCalendar).to.have.been.calledWith('removeEventSource');
      expect(ctrl.hiddenCalendars['calendars/456.json']).to.not.be.undefined;
    });

    it('should add the toggled calendar to the eventSourcesMap and remove it from the hidden calendars list', function() {
      const scope = $rootScope.$new();

      const ctrl = initController(scope);

      $rootScope.$digest();

      ctrl.calendarReady(calendar);

      $rootScope.$broadcast(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {
        calendarUniqueId: 'calendars/456.json',
        hidden: false
      });

      $timeout.flush();

      expect(calendar.fullCalendar).to.have.been.calledWith('addEventSource');
      expect(ctrl.hiddenCalendars['calendars/456.json']).to.be.undefined;
    });

    it('should attempt to remove the toggled \'on\' calendar from fullcalendar before adding it to avoid duplicated events', function() {
      const scope = $rootScope.$new();
      const ctrl = initController(scope);

      $rootScope.$digest();

      ctrl.calendarReady(calendar);

      $rootScope.$broadcast(CAL_EVENTS.CALENDARS.TOGGLE_VIEW, {
        calendarUniqueId: 'calendars/456.json',
        hidden: false
      });

      $timeout.flush();

      expect(calendar.fullCalendar).to.have.been.calledWith('removeEventSource');
      expect(ctrl.hiddenCalendars['calendars/456.json']).to.be.undefined;
    });
  });
});
