'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalCalendarRootController controller', function() {

  var $q, $controller, $rootScope, $scope, calendarService, calDefaultValue, businessHours, calendarHomeId, CAL_DEFAULT_OLD_CALENDAR_ID;

  beforeEach(function() {
    angular.mock.module('esn.calendar');
  });

  beforeEach(function() {
    CAL_DEFAULT_OLD_CALENDAR_ID = 'events';
    businessHours = [{ start: 'date' }];
    calendarHomeId = 123456;
  });

  beforeEach(angular.mock.inject(function(_$q_, _$controller_, _$rootScope_, _calDefaultValue_, _calendarService_) {
    $q = _$q_;
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    calDefaultValue = _calDefaultValue_;
    calendarService = _calendarService_;
    $scope = $rootScope.$new();
  }));

  function initController() {
    var controller = $controller('CalCalendarRootController', { $scope: $scope, businessHours: businessHours, calendarHomeId: calendarHomeId });

    $scope.$digest();

    return controller;
  }

  describe('The initialization', function() {
    it('should set the controller', function() {
      sinon.stub(calendarService, 'getCalendar', function() {
        return $q.when({});
      });

      initController();

      expect($scope.calendarHomeId).to.deep.equal(calendarHomeId);
      expect($scope.businessHours).to.deep.equal(businessHours);
      expect(calDefaultValue.get('calendarId')).to.deep.equal(CAL_DEFAULT_OLD_CALENDAR_ID);
    });

    it('should set calDefaultValue with calendarHomeId when calendarService.getCalendar return 404', function() {
      sinon.stub(calendarService, 'getCalendar', function() {
        return $q.reject({
          status: 404
        });
      });
      initController();

      expect(calDefaultValue.get('calendarId')).to.deep.equal(calendarHomeId);
    });
  });
});
