'use strict';

/* global chai, moment: false */

var expect = chai.expect;

describe('CalRRuleShell Factory', function() {
  var CalRRuleShell, ICAL, CAL_RECUR_FREQ;

  beforeEach(function() {
    angular.mock.module('esn.calendar.libs');
    angular.mock.inject(function(_CalRRuleShell_, _ICAL_, _CAL_RECUR_FREQ_) {
      CalRRuleShell = _CalRRuleShell_;
      ICAL = _ICAL_;
      CAL_RECUR_FREQ = _CAL_RECUR_FREQ_;
    });
  });

  describe('should create CalRRuleShell object funcation', function() {
    it('should call updateParentEvent when create CalRRuleShell object with interval does not exist', function() {
      var rrule = {
        freq: CAL_RECUR_FREQ[0]
      };
      var vevent = new ICAL.Component('vevent');
      var shell = new CalRRuleShell(rrule, vevent);

      expect(shell.vevent.getFirstPropertyValue('rrule').interval).to.deep.equal(1);
    });
  });

  describe('set count', function() {
    var shell, vevent;

    beforeEach(function() {
      var rrule = {
        freq: CAL_RECUR_FREQ[0]
      };

      vevent = new ICAL.Component('vevent');
      shell = new CalRRuleShell(rrule, vevent);
    });

    it('should delete the count cache property', function() {
      shell.__count = 42;
      shell.count = 2;
      expect(shell.__count).to.be.undefined;
    });

    it('should fail for non number value', function() {
      expect(function() {
        shell.count = 'toto';
      }).to.throw(Error);
    });

    it('should accept accept undefined value', function() {
      shell.count = undefined;
      expect(shell.rrule.count).to.be.undefined;
    });

    it('should copy number as if (without packing them in an array)', function() {
      shell.count = 42;
      expect(shell.rrule.count).to.equals(42);
    });
  });

  describe('set until', function() {
    var shell, vevent;

    beforeEach(function() {
      var rrule = {
        until: '20200625T114000'
      };

      vevent = new ICAL.Component('vevent');
      shell = new CalRRuleShell(rrule, vevent);
    });

    it('should delete the until cache property', function() {
      shell.__until = 42;
      shell.until = '';
      expect(shell.__until).to.be.undefined;
    });

    it('should accept undefined value', function() {
      shell.until = undefined;
      expect(shell.rrule.until).to.be.undefined;
    });

    it('should set time to the end of the until date and convert to UTC timezone if input is a Moment object', function() {
      shell.until = moment.tz('2020-06-25 14:30:00', 'Asia/Thimphu'); // offset +0600

      expect(shell.rrule.until._time).to.shallowDeepEqual({
        year: 2020,
        month: 6,
        day: 25,
        hour: 17,
        minute: 59,
        second: 59
      });
    });

    it('should set time to the end of the until date and convert to UTC timezone if input is a Date object', function() {
      shell.until = new Date('2020-06-25T14:30:00.000');

      var expectedTime = new Date(2020, 5, 25, 23, 59, 59);

      expect(shell.rrule.until._time).to.shallowDeepEqual({
        year: expectedTime.getUTCFullYear(),
        month: expectedTime.getUTCMonth() + 1,
        day: expectedTime.getUTCDate(),
        hour: expectedTime.getUTCHours(),
        minute: expectedTime.getUTCMinutes(),
        second: expectedTime.getUTCSeconds()
      });
    });
  });
});
