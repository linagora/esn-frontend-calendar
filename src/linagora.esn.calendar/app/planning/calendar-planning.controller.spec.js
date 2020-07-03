'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalCalendarPlanningController', function() {
  var $rootScope, $controller;
  var calFullUiConfiguration;
  var CAL_UI_CONFIG;

  beforeEach(function() {
    module('esn.calendar');

    inject(function(
      _$rootScope_,
      _$controller_,
      _calFullUiConfiguration_,
      _calendarService_,
      _CAL_UI_CONFIG_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      calFullUiConfiguration = _calFullUiConfiguration_;
      CAL_UI_CONFIG = _CAL_UI_CONFIG_;

      _calendarService_.listPersonalAndAcceptedDelegationCalendars = function() {
        return $q.when();
      };
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
  });
});
