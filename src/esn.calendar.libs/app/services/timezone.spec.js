'use strict';

/* global chai, _: false */

const { expect } = chai;

describe('The calRegisterTimezones factory', function() {
  let ICAL, TIMEZONES, ESN_DATETIME_TIMEZONE;

  beforeEach(function() {
    angular.mock.module('esn.calendar.libs');
    angular.mock.inject(function(calRegisterTimezones, _ICAL_, _TIMEZONES_, _ESN_DATETIME_TIMEZONE_) {
      calRegisterTimezones();
      ICAL = _ICAL_;
      TIMEZONES = _TIMEZONES_;
      ESN_DATETIME_TIMEZONE = _ESN_DATETIME_TIMEZONE_;
    });

  });

  it('should register all the timezones that are avaiable in the user configuration', function() {
    const calendarTzList = Object.keys(TIMEZONES.zones).concat(Object.keys(TIMEZONES.aliases));
    const esnUserConfigTzList = ESN_DATETIME_TIMEZONE.map(({ value }) => value);
    const missingTzList = _.difference(esnUserConfigTzList, calendarTzList);

    expect(missingTzList.length).to.equal(0);
  });

  it('should have register timezone', function() {
    angular.forEach(TIMEZONES.zones, function(_data, key) { // eslint-disable-line
      expect(ICAL.TimezoneService.get(key)).to.be.ok;
      expect(ICAL.TimezoneService.get(key).tzid).to.equal(key);
    });
  });

  it('should have register alias', function() {
    angular.forEach(TIMEZONES.aliases, function(_data, key) { // eslint-disable-line
      expect(ICAL.TimezoneService.get(key)).to.be.ok;
    });
  });

  it('should correctly follow alias', function() {
    angular.forEach(TIMEZONES.aliases, function(data, key) {
      expect(ICAL.TimezoneService.get(key)).to.equal(ICAL.TimezoneService.get(data.aliasTo));
    });
  });

});
