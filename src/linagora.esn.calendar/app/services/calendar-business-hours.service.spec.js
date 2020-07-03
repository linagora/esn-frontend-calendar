'use strict';

/* global chai, sinon */

var expect = chai.expect;

describe('The calBusinessHoursService service', function() {
  var $rootScope, $q, calBusinessHoursService, businessHours, esnConfig, ESN_CONFIG_DEFAULT;

  beforeEach(function() {
    angular.mock.module('esn.calendar');
  });

  beforeEach(function() {
    businessHours = [{
      daysOfWeek: [1, 2, 3, 4],
      start: '00:00',
      end: '24:00'
    }];

    esnConfig = sinon.spy(function() {
      return $q.when(businessHours);
    });

    angular.mock.module(function($provide) {
      $provide.value('esnConfig', esnConfig);
    });
  });

  beforeEach(angular.mock.inject(function(_$q_, _calBusinessHoursService_, _ESN_CONFIG_DEFAULT_, _$rootScope_) {
    $q = _$q_;
    calBusinessHoursService = _calBusinessHoursService_;
    ESN_CONFIG_DEFAULT = _ESN_CONFIG_DEFAULT_;
    $rootScope = _$rootScope_;
  }));

  describe('The getUserBusinessHours function', function() {

    function getExpectedResult(businessHours) {
      return businessHours.map(function(businessHour) {
        businessHour.dow = businessHour.daysOfWeek;
        delete businessHour.daysOfWeek;

        return businessHour;
      });
    }

    it('should get user working hours configuration', function(done) {
      calBusinessHoursService.getUserBusinessHours()
        .then(function(result) {
          expect(esnConfig).to.have.been.calledWith('core.businessHours', ESN_CONFIG_DEFAULT.core.businessHours);
          expect(result).to.deep.equal(getExpectedResult(businessHours));
          done();
        });
      $rootScope.$digest();
    });

    it('should get default business hours if there is no configuration', function(done) {
      businessHours = [];
      calBusinessHoursService.getUserBusinessHours()
        .then(function(result) {
          expect(esnConfig).to.have.been.calledWith('core.businessHours', ESN_CONFIG_DEFAULT.core.businessHours);
          expect(result).to.be.empty;
          done();
        });
      $rootScope.$digest();
    });
  });
});
