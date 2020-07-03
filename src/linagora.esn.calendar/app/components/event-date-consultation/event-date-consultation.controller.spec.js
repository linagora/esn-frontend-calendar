'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calEventDateConsultationController', function() {
  var $controller, calMoment, CalendarShell;

  beforeEach(function() {
    angular.mock.module('esn.calendar');

    angular.mock.inject(function(_$controller_, _calMoment_, _CalendarShell_) {
      $controller = _$controller_;
      calMoment = _calMoment_;
      CalendarShell = _CalendarShell_;
    });
  });

  function initController(bindings) {
    return $controller('calEventDateConsultationController', null, bindings);
  }

  describe('when the event takes place within one day only', function() {
    it('should set start format to display date only and end date to undefined when the event is an \'All day\' event', function() {
      var bindings = {
        event: CalendarShell.fromIncompleteShell({
          start: calMoment('2016-12-06'),
          end: calMoment('2016-12-07'),
          location: 'aLocation'
        })
      };
      var ctrl = initController(bindings);

      ctrl.event.start._ambigTime = false;

      expect(ctrl.start).to.equal(ctrl.event.start.format('MMM D'));
      expect(ctrl.end).to.be.undefined;
    });

    it('should set start format to display both date and time and end format to hours and minutes only when it is not an \'All day\' event', function() {
      var bindings = {
        event: CalendarShell.fromIncompleteShell({
          start: calMoment('2016-12-06 00:00'),
          end: calMoment('2016-12-06 01:00'),
          location: 'aLocation'
        })
      };
      var ctrl = initController(bindings);

      expect(ctrl.start).to.equal(ctrl.event.start.format('MMM D HH:mm'));
      expect(ctrl.end).to.equal(ctrl.event.end.format('HH:mm'));
    });
  });

  describe('when the event lasts more than one day', function() {
    it('should set start and end format to display date only when the event is an \'All day\' event', function() {
      var bindings = {
        event: CalendarShell.fromIncompleteShell({
          start: calMoment('2016-12-06'),
          end: calMoment('2016-12-08'),
          location: 'aLocation'
        })
      };
      var ctrl = initController(bindings);

      ctrl.event.start._ambigTime = false;
      ctrl.event.end._ambigTime = false;

      expect(ctrl.start).to.equal(ctrl.event.start.format('MMM D'));
      expect(ctrl.end).to.equal(ctrl.event.end.clone().subtract(1, 'day').format('MMM D'));
    });

    it('should set start and end format to display both date and time when the event is not an \'All day\' event', function() {
      var bindings = {
        event: CalendarShell.fromIncompleteShell({
          start: calMoment('2016-12-06 00:00'),
          end: calMoment('2016-12-07 01:00'),
          location: 'aLocation'
        })
      };
      var ctrl = initController(bindings);

      expect(ctrl.start).to.equal(ctrl.event.start.format('MMM D HH:mm'));
      expect(ctrl.end).to.equal(ctrl.event.end.format('MMM D HH:mm'));
    });
  });
});
