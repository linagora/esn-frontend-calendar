'use strict';

/* global chai, _: false */

var expect = chai.expect;

describe('The CalCalendarRightsUtilsService service', function() {
  var self;

  beforeEach(function() {
    self = this;
    angular.mock.module('esn.calendar');
  });

  beforeEach(angular.mock.inject(function(CalCalendarRightsUtilsService, CAL_CALENDAR_PUBLIC_RIGHT, CAL_CALENDAR_SHARED_RIGHT) {
    this.CalCalendarRightsUtilsService = CalCalendarRightsUtilsService;
    this.CAL_CALENDAR_PUBLIC_RIGHT = CAL_CALENDAR_PUBLIC_RIGHT;
    this.CAL_CALENDAR_SHARED_RIGHT = CAL_CALENDAR_SHARED_RIGHT;
  }));

  describe('The publicAsHumanReadable function', function() {
    it('should return unknown when input is not defined', function() {
      expect(this.CalCalendarRightsUtilsService.publicAsHumanReadable()).to.equal(this.CAL_CALENDAR_PUBLIC_RIGHT.unknown);
    });

    it('should return unknown when right is not known', function() {
      expect(this.CalCalendarRightsUtilsService.publicAsHumanReadable(this.CAL_CALENDAR_PUBLIC_RIGHT.READ_LABEL + 'you do not know me right???')).to.equal(this.CAL_CALENDAR_PUBLIC_RIGHT.unknown);
    });

    it('should return human readable value', function() {
      _.forEach(this.CAL_CALENDAR_PUBLIC_RIGHT, function(value) {
        var result = self.CalCalendarRightsUtilsService.publicAsHumanReadable(value);

        expect(result).to.be.a.string;
        expect(result).to.not.equal(self.CAL_CALENDAR_PUBLIC_RIGHT.unknown);
      });
    });
  });

  describe('The delegationAsHumanReadable function', function() {
    it('should return unknown when input is not defined', function() {
      expect(this.CalCalendarRightsUtilsService.delegationAsHumanReadable()).to.equal(this.CAL_CALENDAR_SHARED_RIGHT.unknown);
    });

    it('should return unknown when right is not known', function() {
      expect(this.CalCalendarRightsUtilsService.delegationAsHumanReadable(this.CAL_CALENDAR_SHARED_RIGHT.READ_LABEL + 'you do not know me right???')).to.equal(this.CAL_CALENDAR_PUBLIC_RIGHT.unknown);
    });

    it('should return human readable value', function() {
      _.forEach(this.CAL_CALENDAR_SHARED_RIGHT, function(value) {
        var result = self.CalCalendarRightsUtilsService.delegationAsHumanReadable(value);

        expect(result).to.be.a.string;
        expect(result).to.not.equal(self.CAL_CALENDAR_SHARED_RIGHT.unknown);
      });
    });
  });
});
