'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The CalSharedRightsDisplayController controller', function() {
  var $rootScope,
    $scope,
    $controller,
    CalCalendarRightsUtilsService;

  beforeEach(function() {
    angular.mock.module('esn.calendar');
    angular.mock.inject(function(_$rootScope_, _$controller_, _CalCalendarRightsUtilsService_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      CalCalendarRightsUtilsService = _CalCalendarRightsUtilsService_;
      $scope = $rootScope.$new();
    });
  });

  function initController(bindings) {
    return $controller('CalSharedRightsDisplayController', {$scope: $scope}, bindings);
  }

  describe('The $onInit function', function() {
    it('should set the humanReadable property for delegation right', function() {
      var right = 'This is a right';
      var delegationAsHumanReadableStub = sinon.spy(CalCalendarRightsUtilsService, 'delegationAsHumanReadable');
      var controller = initController({delegation: right});

      controller.$onInit();

      expect(delegationAsHumanReadableStub).to.have.been.calledWith(right);
      expect(controller.humanReadable).to.be.defined;
    });

    it('should set the humanReadable property for public right', function() {
      var right = 'This is a right';
      var publicAsHumanReadableStub = sinon.spy(CalCalendarRightsUtilsService, 'publicAsHumanReadable');
      var controller = initController({public: right});

      controller.$onInit();

      expect(publicAsHumanReadableStub).to.have.been.calledWith(right);
      expect(controller.humanReadable).to.be.defined;
    });
  });
});
