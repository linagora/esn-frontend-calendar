'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calEventDateEditionController', function() {
  var $controller, calMoment, calEventUtils, esnI18nDateFormatService, esnDatetimeService;
  var startTestMoment, endTestMoment;
  var longDateFormatMock = 'YYYY-MM-DD';

  beforeEach(function() {
    esnI18nDateFormatService = {
      getLongDateFormat: sinon.stub().returns(longDateFormatMock)
    };

    esnDatetimeService = {
      setAmbigTime: function(src, ambigTime) {
        src._ambigTime = !!ambigTime;

        return src;
      }
    };

    module('esn.calendar', function($provide) {
      $provide.value('esnI18nDateFormatService', esnI18nDateFormatService);
      $provide.value('esnDatetimeService', esnDatetimeService);
    });

    inject(function(_$controller_, _calMoment_, _calEventUtils_) {
      $controller = _$controller_;
      calMoment = _calMoment_;
      calEventUtils = _calEventUtils_;
    });

    startTestMoment = calMoment('2013-02-08 09:30:00Z').utc();
    endTestMoment = calMoment('2013-02-08 10:00:00Z').utc();
  });

  function initController(bindings) {
    var controller = $controller('calEventDateEditionController', null, bindings);

    controller.$onInit();

    return controller;
  }

  function checkEventDateTimeSync(ctrl) {
    if (ctrl.full24HoursDay) {
      expect(ctrl.start.isSame(ctrl.event.start, 'day')).to.be.true;
      expect(ctrl.end.clone().add(1, 'days').isSame(ctrl.event.end, 'day')).to.be.true;

      return;
    }

    expect(ctrl.start.isSame(ctrl.event.start)).to.be.true;
    expect(ctrl.end.isSame(ctrl.event.end)).to.be.true;
  }

  describe('The $onInit function', function() {
    it('should get long date format from esnI18nDateFormatService', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      expect(esnI18nDateFormatService.getLongDateFormat).to.have.been.calledOnce;
      expect(ctrl.dateFormat).to.equal(longDateFormatMock);
    });

    it('should set correct default values for optional bindings', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.disabled).to.be.false;
    });

    it('should set full24HoursDay value of controller to that of the passed-in event', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: true
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.full24HoursDay).to.equal(bindings.event.full24HoursDay);
    });

    it('should not modify start and end input values for non-all-day events', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.start.isSame(bindings.event.start)).to.be.true;
      expect(ctrl.end.isSame(bindings.event.end)).to.be.true;
    });

    it('should subtract end input value by one day for all-day events', function() {
      var bindings = {
        event: {
          start: calEventUtils.stripTimeWithTz(startTestMoment),
          end: calEventUtils.stripTimeWithTz(endTestMoment),
          full24HoursDay: true
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.start.isSame(bindings.event.start, 'day')).to.be.true;
      expect(calEventUtils.stripTimeWithTz(ctrl.end.clone().add(1, 'days')).isSame(bindings.event.end, 'day')).to.be.true;
    });
  });

  describe('The dateOnBlurFn function', function() {
    it('should clone event start and end on input blur', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);
      var startBeforeBlur = ctrl.start;
      var endBeforeBlur = ctrl.end;

      ctrl.dateOnBlurFn();
      expect(ctrl.start).to.not.equal(startBeforeBlur);
      expect(ctrl.end).to.not.equal(endBeforeBlur);
      expect(ctrl.start.isSame(startBeforeBlur)).to.be.true;
      expect(ctrl.end.isSame(endBeforeBlur)).to.be.true;
    });
  });

  describe('The allDayOnChange function', function() {
    it('should strip time from start and end date when "All day" option is selected', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: false
        }
      };
      var ctrl = initController(bindings);

      ctrl.full24HoursDay = true;
      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.isSame(esnDatetimeService.setAmbigTime(startTestMoment, true))).to.be.true;
      expect(ctrl.end.isSame(esnDatetimeService.setAmbigTime(endTestMoment, true))).to.be.true;
    });

    it('should set the time of start and end to next hour when unchecking the "All day" option after just opening an all-day event', function() {
      var bindings = {
        event: {
          start: calEventUtils.stripTimeWithTz(startTestMoment),
          end: calEventUtils.stripTimeWithTz(endTestMoment),
          full24HoursDay: true
        }
      };
      var ctrl = initController(bindings);

      ctrl.full24HoursDay = false;

      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.hasTime()).to.be.true;
      expect(ctrl.end.hasTime()).to.be.true;

      var nextHour = calMoment().startOf('hour').add(1, 'hour');
      var nextHourEnd = nextHour.clone().add(30, 'minute');
      var fmt = 'HH:mm:ss.SSS';

      expect(ctrl.start.format(fmt)).to.equal(nextHour.format(fmt));
      expect(ctrl.end.format(fmt)).to.equal(nextHourEnd.format(fmt));
    });

    it('should remember the time when "All day" option is toggled checked/unchecked', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: false
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.start.isSame(startTestMoment)).to.be.true;
      expect(ctrl.end.isSame(endTestMoment)).to.be.true;

      ctrl.full24HoursDay = true;
      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.isSame(esnDatetimeService.setAmbigTime(startTestMoment, true))).to.be.true;
      expect(ctrl.end.isSame(esnDatetimeService.setAmbigTime(endTestMoment, true))).to.be.true;

      ctrl.full24HoursDay = false;
      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.isSame(startTestMoment)).to.be.true;
      expect(ctrl.end.isSame(endTestMoment)).to.be.true;
    });
  });

  describe('The getMinEndDate function', function() {
    it('should return start date minus 1 day', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: false
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.getMinEndDate()).to.equal(ctrl.start.clone().subtract(1, 'days').format('YYYY-MM-DD'));
    });
  });

  describe('The onStartDateChange function', function() {
    it('should set end to start plus the previously stored diff', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      ctrl.onStartDateChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.clone().add(ctrl.end.diff(ctrl.start)).isSame(ctrl.end)).to.be.true;
    });

    it('should call onDateChange', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        },
        onDateChange: sinon.spy()
      };
      var ctrl = initController(bindings);

      ctrl.onStartDateChange();
      checkEventDateTimeSync(ctrl);

      expect(bindings.onDateChange).to.have.been.calledOnce;
    });

    it('should ignore null date and invalid date', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      [null, calMoment('invalid date')].forEach(function(date) {
        ctrl.start = date;
        ctrl.onStartDateChange();

        expect(bindings.event.end.isSame(ctrl.end)).to.be.true;
      }, this);
    });
  });

  describe('The onEndDateChange function', function() {
    it('should compute diff between start and end', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      ctrl.onEndDateChange();
      checkEventDateTimeSync(ctrl);
      var diff = ctrl.end.diff(ctrl.start);

      ctrl.start = startTestMoment.clone().add(2, 'days');
      ctrl.onStartDateChange();

      expect(ctrl.end.isSame(ctrl.start.clone().add(diff))).to.be.true;
    });

    it('should set end to start plus 30 min if end is before start', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      ctrl.end = ctrl.start.clone().subtract(1, 'days');
      ctrl.onEndDateChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.end.isSame(ctrl.start.clone().add(30, 'minutes'))).to.be.true;
    });

    it('should ignore null date and invalid date', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      [null, calMoment('invalid date')].forEach(function(date) {
        ctrl.end = date;
        ctrl.onStartDateChange();

        expect(bindings.event.start.isSame(ctrl.start)).to.be.true;
      }, this);
    });

    it('should call onDateChange', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        },
        onDateChange: sinon.spy()
      };
      var ctrl = initController(bindings);

      ctrl.onStartDateChange();
      checkEventDateTimeSync(ctrl);

      expect(bindings.onDateChange).to.have.been.calledOnce;
    });
  });
});
