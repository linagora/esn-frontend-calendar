'use strict';

/* global chai: false */
/* global sinon: false */

const expect = chai.expect;

describe('the calTimeSelectController', function() {
  var $controller, calMoment, $scope, testingDate;

  beforeEach(function() {
    angular.mock.module('esn.calendar.libs');

    angular.mock.inject(function(_$controller_, _calMoment_, _$rootScope_) {
      $controller = _$controller_;
      calMoment = _calMoment_;
      $scope = _$rootScope_.$new();
    });

    testingDate = calMoment('2020-10-02 14:00:00Z').utc();
  });

  function initCtrl(bindings) {
    const controller = $controller('calTimeSelectController',
      { $scope, $element: $('<div></div>') },
      {
        ...bindings,
        date: testingDate
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

    it('should initialize the event selected time correctly in 12h format', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr'
        }
      );
      const expectedTime = '14:00';

      expect(ctrl.selectedTime).to.equal(expectedTime);
    });

    it('should generate all the possible time options for 24H format', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr'
        }
      );

      // 96 is the number of time options
      // given each hour we have 4 options ( each 15 minutes )
      expect(ctrl.timeOptions).to.have.lengthOf(96);
      expect(ctrl.timeOptions[0]).to.equal('0:00');
      expect(ctrl.timeOptions[95]).to.equal('23:45');

      // check a random hour options.
      expect(ctrl.timeOptions[60]).to.equal('15:00');
      expect(ctrl.timeOptions[61]).to.equal('15:15');
      expect(ctrl.timeOptions[62]).to.equal('15:30');
      expect(ctrl.timeOptions[63]).to.equal('15:45');
    });

    it('should generate all the possible time options for 12h format', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'h:mm A',
          locale: 'ru'
        }
      );

      // 96 is the number of time options
      // given each hour we have 4 options ( each 15 minutes )
      // ночи means AM in russian, and дня means PM
      expect(ctrl.timeOptions).to.have.lengthOf(96);
      expect(ctrl.timeOptions[0]).to.equal('12:00 ночи');
      expect(ctrl.timeOptions[95]).to.equal('11:45 вечера');

      // check a random hour options.
      expect(ctrl.timeOptions[60]).to.equal('3:00 дня');
      expect(ctrl.timeOptions[61]).to.equal('3:15 дня');
      expect(ctrl.timeOptions[62]).to.equal('3:30 дня');
      expect(ctrl.timeOptions[63]).to.equal('3:45 дня');
    });

    it('should use the provided locale to format the time', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'h:mm A',
          locale: 'ru'
        }
      );

      expect(ctrl.selectedTime).to.equal('2:00 дня');
    });

    it('should use the correct locale', () => {
      const ctrl = initCtrl(
        {
          timeFormat: 'h:mm A',
          locale: 'zh'
        }
      );

      expect(ctrl.locale).to.eq('zh-cn');
    });
  });

  describe('the onTimeInputChange event handler', function() {
    it('should validate the content of the time input', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => { }
        }
      );

      ctrl.selectedTime = 'ABCDEF';
      ctrl.onTimeInputChange();
      expect(ctrl.isInputValid).to.equal(false);
    });
  });

  describe('the onTimeSelectBlur event handler', function() {
    it('should reject invalid input and resets back to initial time', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => { }
        }
      );

      ctrl.selectedTime = 'SOMETHING WRONG';
      ctrl.onTimeInputChange();
      ctrl.onTimeSelectBlur();
      expect(ctrl.selectedTime).to.equal('14:00');
      expect(ctrl.isInputValid).to.be.true;
    });

    it('should convert user input to the correct format when he writes an input with a different time format', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'h:mm A',
          locale: 'fr',
          onTimeChange: () => { }
        }
      );

      ctrl.selectedTime = '17:00';
      ctrl.onTimeInputChange();
      ctrl.onTimeSelectBlur();
      expect(ctrl.selectedTime).to.equal('5:00 PM');
      expect(ctrl.isInputValid).to.be.true;
    });
  });

  describe('the onSelectingTimeOption event handler', function() {
    it('should set the new time when it is valid', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => {}
        }
      );

      ctrl.onSelectingTimeOption('13:00');
      expect(ctrl.date.hour()).to.equal(13);
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

      ctrl.onSelectingTimeOption('13:00');
      expect(ctrl.onTimeChange).to.have.been.called;
    });

    it('should set the time correctly depending on the chosen locale', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'h:mm A',
          locale: 'vi',
          onTimeChange: () => {}
        }
      );

      ctrl.onSelectingTimeOption('2:00 CH');
      expect(ctrl.date.hour()).to.equal(14);
      expect(ctrl.date.minute()).to.equal(0);
    });
  });

  describe('the onInputKeydown event handler', function() {
    it('should validate and correct the user input when he presses enter', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => {}
        }
      );
      const event = {
        key: 'Enter',
        preventDefault: sinon.spy()
      };
      const menu = {
        close: () => {}
      };

      ctrl.isInputValid = true;
      ctrl.selectedTime = 'ABCDEF';
      ctrl.onTimeInputChange();
      ctrl.onInputKeydown(event, menu);
      expect(ctrl.isInputValid).to.be.true;
      expect(ctrl.selectedTime).to.equal('14:00');
    });

    it('should close the menu when the user presses enter', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => {}
        }
      );
      const event = {
        key: 'Enter',
        preventDefault: () => {}
      };
      const menu = {
        close: sinon.spy()
      };

      ctrl.onInputKeydown(event, menu);
      expect(menu.close).to.have.been.called;
    });

    it('should not validate or close the menu when the user is writing', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => { }
        }
      );
      const event = {
        key: 'A',
        preventDefault: () => { }
      };
      const menu = {
        close: sinon.spy()
      };

      ctrl.onTimeSelectBlur = sinon.spy();

      ctrl.onInputKeydown(event, menu);
      expect(menu.close).to.not.have.been.called;
      expect(ctrl.onTimeSelectBlur).to.not.have.been.called;
    });

    it('should close the mdMenu when the user presses Tab', function() {
      const ctrl = initCtrl(
        {
          timeFormat: 'H:mm',
          locale: 'fr',
          onTimeChange: () => { }
        }
      );
      const event = {
        key: 'Tab',
        preventDefault: () => { }
      };
      const menu = {
        close: sinon.spy()
      };

      ctrl.onTimeSelectBlur = sinon.spy();

      ctrl.onInputKeydown(event, menu);
      expect(menu.close).to.have.been.called;
      expect(ctrl.onTimeSelectBlur).to.not.have.been.called;
    });
  });
});
