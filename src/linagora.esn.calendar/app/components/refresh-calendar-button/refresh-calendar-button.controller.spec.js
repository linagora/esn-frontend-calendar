'use strict';

/* global chai, sinon */

const { expect } = chai;

describe('The CalRefreshCalendarButtonController controller', function() {
  let $rootScope, $controller, CAL_EVENTS;
  let calCachedEventSourceMock;

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    calCachedEventSourceMock = {
      resetCache: sinon.stub()
    };

    angular.mock.module(function($provide) {
      $provide.value('calCachedEventSource', calCachedEventSourceMock);
    });
  });

  beforeEach(angular.mock.inject(function(_$rootScope_, _$controller_, _CAL_EVENTS_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    CAL_EVENTS = _CAL_EVENTS_;

    $rootScope.$broadcast = sinon.stub();
  }));

  function initController() {
    return $controller('CalRefreshCalendarButtonController', {
      $scope: {}
    });
  }

  describe('The refreshCalendar method', function() {
    it('should reset cache and emit an event to redraw calendar', function() {
      const controller = initController();

      controller.refreshCalendar();

      expect(calCachedEventSourceMock.resetCache).to.have.been.calledOnce;
      expect($rootScope.$broadcast).to.have.been.calledWith(CAL_EVENTS.CALENDAR_REFRESH);
    });
  });
});
