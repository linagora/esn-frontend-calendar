'use strict';

/* global chai, sinon, _: false */

const { expect } = chai;

describe('The calendarUtils service', function() {
  let self = this;
  let $rootScope, CAL_EVENTS;
  let notificationFactoryMock, setCancelActionStub, calCachedEventSourceMock;

  beforeEach(function() {
    self = this;

    angular.mock.module('esn.calendar.libs');
    angular.mock.module('esn.ical');
    self.calMomentMock = null;

    setCancelActionStub = sinon.stub();
    notificationFactoryMock = {
      strongError: sinon.stub().returns({
        setCancelAction: setCancelActionStub
      })
    };

    calCachedEventSourceMock = {
      resetCache: sinon.stub()
    };

    angular.mock.module(function($provide) {
      $provide.decorator('calMoment', function($delegate) {
        return function() {
          return (self.calMomentMock || $delegate).apply(this, arguments);
        };
      });
      $provide.value('notificationFactory', notificationFactoryMock);
      $provide.value('calCachedEventSource', calCachedEventSourceMock);
    });
  });

  beforeEach(angular.mock.inject(function(_$rootScope_, _CAL_EVENTS_, calendarUtils, calMoment) {
    self.calendarUtils = calendarUtils;
    self.calMoment = calMoment;
    $rootScope = _$rootScope_;
    CAL_EVENTS = _CAL_EVENTS_;
  }));

  describe('the getDateOnCalendarSelect function', function() {
    it('should have the same date in input and output', function() {
      var start = self.calMoment('2013-02-08 09:30:00');
      var end = self.calMoment('2013-02-08 10:00:00');
      var expectedStart = start.clone();
      var expectedEnd = end.clone();
      var date = self.calendarUtils.getDateOnCalendarSelect(start, end);

      expect(expectedStart.isSame(date.start)).to.be.true;
      expect(expectedEnd.isSame(date.end)).to.be.true;
    });

    it('should return same start and end if the diff is not 30 minutes', function() {
      var start = self.calMoment('2013-02-08 09:00:00');
      var end = self.calMoment('2013-02-08 11:30:00');
      var expectedStart = self.calMoment('2013-02-08 09:00:00');
      var expectedEnd = self.calMoment('2013-02-08 11:30:00');
      var date = self.calendarUtils.getDateOnCalendarSelect(start, end);

      expect(expectedStart.isSame(date.start)).to.be.true;
      expect(expectedEnd.isSame(date.end)).to.be.true;
    });
  });

  describe('the getNewStartDate', function() {
    it('should return the next hour returned by getNewStartDate', function() {
      [
        { input: '10:00', output: '10:30' },
        { input: '10:01', output: '10:30' },
        { input: '11:31', output: '12:00' },
        { input: '11:59', output: '12:00' },
        { input: '12:30', output: '13:00' }
      ].map(function(obj) {
        return _.mapValues(obj, function(hour) {
          return self.calMoment('1991-10-03 ' + hour);
        });
      }).forEach(function(obj) {
        self.calMomentMock = sinon.stub().returns(obj.input);
        var result = self.calendarUtils.getNewStartDate();

        expect(result.isSame(obj.output, 'second')).to.be.true;
        expect(self.calMomentMock).to.have.been.calledOnce;
      }, this);
    });
  });

  describe('the getNewEndDate', function() {
    it('should return the next hour returned by getNewStartDate', function() {
      [
        { input: '10:00', output: '11:30' },
        { input: '10:01', output: '11:30' },
        { input: '11:31', output: '13:00' },
        { input: '11:59', output: '13:00' },
        { input: '12:30', output: '14:00' }
      ].map(function(obj) {
        return _.mapValues(obj, function(hour) {
          return self.calMoment('1991-10-03 ' + hour);
        });
      }).forEach(function(obj) {
        self.calMomentMock = sinon.stub().returns(obj.input);
        var result = self.calendarUtils.getNewEndDate();

        expect(result.isSame(obj.output, 'second')).to.be.true;
        expect(self.calMomentMock).to.have.been.calledOnce;
      }, this);
    });
  });

  describe('the notifyErrorWithRefreshCalendarButton function', function() {
    it('should display an error notification with the button to refresh calendar', function() {
      const message = 'Something went wrong';

      $rootScope.$broadcast = sinon.stub();

      self.calendarUtils.notifyErrorWithRefreshCalendarButton(message);

      expect(notificationFactoryMock.strongError).to.have.been.calledWith('', message);
      expect(setCancelActionStub).to.have.been.calledOnce;

      const setCancelActionArg = setCancelActionStub.getCall(0).args[0];

      expect(setCancelActionArg.linkText).to.deep.equal('Refresh calendar');

      setCancelActionArg.action();

      expect(calCachedEventSourceMock.resetCache).to.have.been.calledOnce;
      expect($rootScope.$broadcast).to.have.been.calledWith(CAL_EVENTS.CALENDAR_REFRESH);
    });
  });
});
