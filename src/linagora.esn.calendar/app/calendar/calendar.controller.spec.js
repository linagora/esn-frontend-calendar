'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalCalendarController controller', function() {

  var calFullUiConfiguration, $q, $controller, $rootScope, $scope, context, businessHours;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('esn.calendar');
  });

  beforeEach(function() {
    businessHours = [{ start: 'date' }];
    context = {
      businessHours: businessHours
    };

  });

  beforeEach(angular.mock.inject(function(_$q_, _$controller_, _$rootScope_, _calFullUiConfiguration_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    calFullUiConfiguration = _calFullUiConfiguration_;
    $scope = $rootScope.$new();
  }));

  function initController() {
    return $controller('CalCalendarController', { $scope: $scope }, context);
  }

  describe('The $onInit function', function() {
    var ctrl;

    beforeEach(function() {
      ctrl = initController();
    });

    it('should set the controller calCalendarMain from calFullUiConfiguration service', function() {
      sinon.stub(calFullUiConfiguration, 'get').returns($q.when({ calendar: {} }));
      ctrl.$onInit();
      $scope.$digest();

      expect(ctrl.uiConfig.calendar.businessHours).to.deep.equal(businessHours);
      expect(ctrl.uiConfig.calendar.scrollTime).to.deep.equal(businessHours[0].start);
    });
  });
});
