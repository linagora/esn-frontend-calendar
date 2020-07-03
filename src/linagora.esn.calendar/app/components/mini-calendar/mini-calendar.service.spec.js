'use strict';

/* global chai, sinon, moment: false */

var expect = chai.expect;

describe('The miniCalendarService service', function() {
  var calMoment, miniCalenderService;

  beforeEach(function() {
    angular.mock.module('esn.calendar', 'linagora.esn.graceperiod');
    moment.tz.setDefault('Europe/Paris');
  });

  afterEach(function() {
    moment.tz.setDefault(null);
  });

  beforeEach(angular.mock.inject(function(_calMoment_, _miniCalendarService_) {
    calMoment = _calMoment_;
    miniCalenderService = _miniCalendarService_;
  }));

  describe('The getWeekAroundDay function', function() {
    it('should return the week around a day depending of the miniCalendarConfig', function() {
      function forEachDayInEachPossibleWeek(callback) {
        var start = calMoment('2015-11-16');
        var nextWeekStart, day, i, j;

        for (i = 0; i < 7; i++) {
          nextWeekStart = calMoment(start);
          nextWeekStart.add(7, 'days');
          for (j = 0; j < 7; j++) {
            day = calMoment(start);
            callback(calMoment(day), calMoment(start), calMoment(nextWeekStart));
            day.add(1, 'days');
          }
          start.add(1, 'days');
        }
      }

      //we check that for every fullCalendar.firstDay possible
      //and for each day possible in the week, the computed period is good
      forEachDayInEachPossibleWeek(function(day, startWeek, nextWeekStart) {
        var week = miniCalenderService.getWeekAroundDay({firstDay: startWeek.isoWeekday()}, day);

        expect(startWeek.isSame(week.firstWeekDay, 'day')).to.be.true;
        expect(nextWeekStart.isSame(week.nextFirstWeekDay, 'day')).to.be.true;
      });
    });
  });

  describe('The forEachDayOfEvent function', function() {
    var event, aDay, spy;

    beforeEach(function() {
      aDay = calMoment('2015-11-30T11:39:00.376Z');
      event = {start: calMoment(aDay)};

      spy = sinon.spy(function(day) {
        expect(day.isSame(aDay, 'day')).to.be.true;
        aDay.add(1, 'days');
      });

    });

    it('should iter on each day where the event is present', function() {
      event.end = calMoment('2015-12-02T11:39:00.376Z');
      miniCalenderService.forEachDayOfEvent(event, spy);

      expect(spy).to.have.been.calledThrice;
    });

    it('should call callback only on start day if no end day', function() {
      miniCalenderService.forEachDayOfEvent(event, spy);

      expect(spy).to.have.been.calledOnce;
    });

    it('should exclude the technical end date for allday events', function() {
      event.start = calMoment('2015-11-30');
      event.end = calMoment('2015-12-01');
      event.full24HoursDay = true;
      miniCalenderService.forEachDayOfEvent(event, spy);

      expect(spy).to.have.been.calledOnce;
    });

    it('should not add a day to end da if the end day equals 00:00 or 12 am', function() {
      aDay = calMoment('2016-10-25 09:00');
      event = {
        start: calMoment(aDay),
        end: calMoment('2016-10-26 00:00')
      };

      miniCalenderService.forEachDayOfEvent(event, spy);
      expect(spy).to.have.been.calledOnce;
    });

    it('should call callback on start day if end is before start', function() {
      aDay = calMoment('2016-10-25 09:00');
      event = {
        start: calMoment(aDay),
        end: calMoment('2016-10-24 00:00')
      };

      miniCalenderService.forEachDayOfEvent(event, spy);
      expect(spy).to.have.been.calledOnce;
    });
  });
});
