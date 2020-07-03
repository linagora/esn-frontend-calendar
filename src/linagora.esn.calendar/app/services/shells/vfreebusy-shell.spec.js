'use strict';

/* global chai, __FIXTURES__: false */

var expect = chai.expect;

describe('CalVfreebusyShell factory', function() {
  var ICAL, CalVfreebusyShell, vfreebusy, myFreeBusyShell;

  beforeEach(function() {
    angular.mock.module('esn.calendar');
    angular.mock.inject(function(_ICAL_, _CalVfreebusyShell_) {
      ICAL = _ICAL_;
      CalVfreebusyShell = _CalVfreebusyShell_;
    });

    function getComponentFromFixture(string) {
      var path = 'frontend/app/fixtures/calendar/vfreebusy_test/' + string;

      return new ICAL.Component(JSON.parse(__FIXTURES__[path]));
    }

    vfreebusy = getComponentFromFixture('vfreebusy.json');
    myFreeBusyShell = new CalVfreebusyShell(vfreebusy);
  });

  describe('The isAvailable function', function() {
    it('should be true on empty parameters', function() {
      expect(myFreeBusyShell.isAvailable()).to.be.true;
    });

    it('should be true when interval given is during free day time interval', function() {
      expect(myFreeBusyShell.isAvailable('2018-03-01T00:00:00Z', '2018-03-01T10:00:00Z')).to.be.true;
    });

    it('should be true when  interval given is during free day & hour interval', function() {
      expect(myFreeBusyShell.isAvailable('2018-03-04T09:00:00Z', '2018-03-04T10:00:00Z')).to.be.true;
    });

    it('should be false when interval given is during busy day & hour interval', function() {
      expect(myFreeBusyShell.isAvailable('2018-03-04T10:30:00Z', '2018-03-04T11:30:00Z')).to.be.false;
    });

    it('should be false when interval given equal busy interval', function() {
      expect(myFreeBusyShell.isAvailable('2018-03-03T10:00:00Z', '2018-03-03T11:00:00Z')).to.be.false;
    });

    it('should be false when busy interval is during given day & hour time interval', function() {
      expect(myFreeBusyShell.isAvailable('2018-03-03T09:00:00Z', '2018-03-03T13:30:00Z')).to.be.false;
    });

    it('should be false when busy interval is during given days', function() {
      expect(myFreeBusyShell.isAvailable('2018-03-01T09:00:00Z', '2018-03-10T10:30:00Z')).to.be.false;
    });
  });
});
