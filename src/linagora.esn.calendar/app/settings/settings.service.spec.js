'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calSettingsService service', function() {
  var $rootScope, $state, calSettingsService;

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    angular.mock.inject(function(_$rootScope_, _$state_, _calSettingsService_) {
      $rootScope = _$rootScope_;
      $state = _$state_;
      calSettingsService = _calSettingsService_;
    });

  });

  describe('The getStatus function', function() {
    it('should return self.status', function() {
      const newStatus = 'updated';

      calSettingsService.updateStatus(newStatus);

      expect(calSettingsService.getStatus()).to.deep.equal('updated');
    });

  });

  describe('The updateStatus function', function() {
    beforeEach(function() {
      $rootScope.$broadcast = sinon.spy();
      $state.reload = sinon.spy();
    });
    it('$rootScope.$broadcast should have been called with cal-settings:status:updated', function() {
      const newStatus = 'updated';

      calSettingsService.updateStatus(newStatus);

      expect($rootScope.$broadcast).to.have.been.calledWith('cal-settings:status:updated', 'updated');
    });
  });
});
