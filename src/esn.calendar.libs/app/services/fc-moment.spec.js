'use strict';

/* global chai: false */
/* global sinon: false */
var expect = chai.expect;

describe('calMoment factory', function() {

  beforeEach(function() {
    this.esnDatetimeServiceMock = {
      updateObjectToUserTimeZone: sinon.spy()
    };

    this.window = {
      $: {
        fullCalendar: {}
      },
      Waves: {
        init: function() {}
      }
    };

    var self = this;

    angular.mock.module('esn.calendar.libs');
    angular.mock.module(function($provide) {
      $provide.value('$window', self.window);
      $provide.value('esnDatetimeService', self.esnDatetimeServiceMock);
    });
  });

  beforeEach(function() {
    inject(function(calMoment, ICAL) {
      this.calMoment = calMoment;
      this.ICAL = ICAL;
    });
  });

  it('call fullCalendar.moment directly if there is no argument', function(done) {
    this.window.$.fullCalendar.moment = function() {
      expect(arguments.length).to.equal(0);
      done();
    };
    this.calMoment();
  });

  it('call fullCalendar.moment directly if the argument is not an ICAL.Time', function(done) {
    var date = new Date();

    this.window.$.fullCalendar.moment = function() {
      expect(arguments[0]).to.deep.equal(date);
      done();
    };
    this.calMoment(date);
  });

  it('call fullCalendar.moment with the result of toJSDate of ical', function() {
    var icalTime = this.ICAL.Time.fromJSDate(new Date());

    icalTime.isDate = true;

    var emptyMomentObject = {};

    var options = {
      _ambigTime: true
    };

    this.window.$.fullCalendar.moment = function(dt) {
      expect(dt).to.deep.equal(icalTime.toJSDate());

      return {
        local: function() {
          return emptyMomentObject;
        }
      };
    };

    this.calMoment(icalTime);

    expect(this.esnDatetimeServiceMock.updateObjectToUserTimeZone).to.have.been.calledWith(emptyMomentObject, options);
  });

  it('has a duration method which is like moment.duration', function() {
  /*global moment*/
    expect(this.calMoment.duration).to.deep.equal(moment.duration);
  });

});
