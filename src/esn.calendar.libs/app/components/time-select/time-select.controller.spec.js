'use strict';

/* global chai: false */
/* global sinon: false */

const expect = chai.expect;

describe('the calTimeSelectController', function() {
  var $controller, calMoment, $scope, testingDate;

  beforeEach(function() {
    angular.mock.module('esn.calendar.libs', function($provide) {
      $provide.value('esnDatetimeService', () => {});
    });

    angular.mock.inject(function(_$controller_, _calMoment_, _$rootScope_) {
      $controller = _$controller_;
      calMoment = _calMoment_;
      $scope = _$rootScope_.$new();

    });

    testingDate = calMoment('2020-10-02 14:00:00Z').utc();
  });

  function initCtrl(bindings) {
    const controller = $controller('calTimeSelectController',
      { $scope },
      {
        ...bindings,
        date: testingDate.clone()
      });

    controller.$onInit();
    $scope.$digest();

    return controller;
  }

  describe('the $onInit function', function() {
    it('should initialize the event selected time correctly in 24H format', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'h:mm A',
          locale: 'fr'
        }
      );

      const expectedTime = '2:00 PM';

      expect(ctrl.selectedTime).to.equal(expectedTime);
    });

    it('should set the selected time correctly in 12h format', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr'
        }
      );
      const expectedTime = '14:00';

      expect(ctrl.selectedTime).to.equal(expectedTime);
    });

    it('should generate all the possible time options', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr'
        }
      );

      // 96 is the number of time options
      // given each hour we have 4 options ( each 15 minutes )
      expect(ctrl.timeOptions).to.have.lengthOf(96);
    });
  });

  describe('the onSetSelectedTime event handler', function() {
    it('should reject invalid input and resets time back to previous state', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr'
        }
      );

      ctrl.onSetSelectedTime('ABCDEF');
      expect(ctrl.isInputValid).to.equal(false);
      ctrl.onTimeSelectBlur();
      expect(ctrl.selectedTime).to.equal('14:00');
    });

    it('should set the new time when it is valid', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => {}
        }
      );

      ctrl.onSetSelectedTime('13:00');
      expect(ctrl.date.hour()).to.equal(14);
      expect(ctrl.date.minute()).to.equal(0);
    });

    it('should call the onTimeChange binding after a date change', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: sinon.spy()
        }
      );

      ctrl.onSetSelectedTime('13:00');
      expect(ctrl.onTimeChange).to.have.been.called;
    });
  });
});
