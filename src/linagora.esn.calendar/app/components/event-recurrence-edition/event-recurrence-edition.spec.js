'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The event-recurrence-edition component', function() {

  var esnI18nService, calMoment;
  var calNow;

  beforeEach(function() {

    esnI18nService = {
      getLocale: sinon.stub().returns('en'),
      translate: sinon.stub().returns({toString: function() {return '';}})
    };

    module('jadeTemplates');
    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('esnI18nService', esnI18nService);
    });

    angular.mock.inject(function(_calMoment_) {
      calMoment = _calMoment_;
    });

    calNow = calMoment();
  });

  beforeEach(inject(['$compile', '$rootScope', function($c, $r) {
    this.$compile = $c;
    this.$scope = $r.$new();

    this.$scope.event = {
      getModifiedMaster: function() {
        return $q.when(this);
      },
      isInstance: function() {
        return false;
      }
    };

    this.$scope.canModifyEventRecurrence = false;

    this.initDirective = function(scope) {
      var html = '<event-recurrence-edition event="event" can-modify-event-recurrence="canModifyEventRecurrence"/>';
      var element = this.$compile(html)(scope);

      scope.$digest();
      this.eleScope = element.isolateScope();

      return element;
    };
  }]));

  describe('activate function', function() {
    it('should set days correctly from input event', function() {
      this.$scope.event.rrule = {
        freq: undefined,
        interval: null,
        byday: ['SA', 'SU']
      };
      this.initDirective(this.$scope);

      expect(this.eleScope.vm.days).to.shallowDeepEqual([
        {value: 'MO', selected: false},
        {value: 'TU', selected: false},
        {value: 'WE', selected: false},
        {value: 'TH', selected: false},
        {value: 'FR', selected: false},
        {value: 'SA', selected: true},
        {value: 'SU', selected: true}
      ]);
    });
  });

  describe('scope.toggleWeekdays', function() {
    it('should splice the weekday and sort the array', function() {
      this.$scope.event.rrule = {
        freq: undefined,
        interval: null
      };
      this.initDirective(this.$scope);
      this.eleScope.vm.event.rrule.byday = ['SU', 'WE', 'TU', 'MO'];
      this.eleScope.vm.toggleWeekdays('WE');
      expect(this.eleScope.vm.event.rrule.byday).to.deep.equal(['MO', 'TU', 'SU']);
    });

    it('should push the weekday and sort the array', function() {
      this.$scope.event.rrule = {
        freq: undefined,
        interval: null
      };
      this.initDirective(this.$scope);
      this.eleScope.vm.event.rrule.byday = ['SU', 'WE', 'TU', 'MO'];
      this.eleScope.vm.toggleWeekdays('FR');
      expect(this.eleScope.vm.event.rrule.byday).to.deep.equal(['MO', 'TU', 'WE', 'FR', 'SU']);
    });
  });

  describe('at end date min value', function() {
    it('should be today', function() {
      this.$scope.event.start = calMoment('2017-09-11 09:30');
      this.$scope.event.rrule = {
        freq: 'WEEKLY'
      };
      this.initDirective(this.$scope);
      var calMinDateAsString = this.eleScope.vm.getMinDate();

      expect(calMinDateAsString).to.be.equal(calNow.format('YYYY-MM-DD'));
    });

    it('should be the event start date', function() {
      this.$scope.event.start = calMoment().add(7, 'days');
      this.$scope.event.rrule = {
        freq: 'WEEKLY'
      };
      this.initDirective(this.$scope);
      var calMinDateAsString = this.eleScope.vm.getMinDate();

      expect(calMinDateAsString).to.be.equal(this.$scope.event.start.format('YYYY-MM-DD'));
    });
  });

  describe('scope.selectEndRadioButton', function() {
    it('should set the correct radio button to checked', function() {
      this.$scope.event.rrule = {
        freq: 'WEEKLY'
      };
      var element = this.initDirective(this.$scope);

      this.eleScope.selectEndRadioButton(2);
      var radio = angular.element(element).find('input[name="inlineRadioEndOptions"]')[2];

      expect(radio.checked).to.be.true;
    });

    it('should set until to undefined if index is 1', function() {
      this.$scope.event.rrule = {
        freq: 'WEEKLY',
        until: 'UNTIL'
      };
      this.initDirective(this.$scope);
      this.eleScope.selectEndRadioButton(1);
      expect(this.eleScope.vm.event.rrule.until).to.be.undefined;
    });

    it('should set count to undefined if index is 2', function() {
      this.$scope.event.rrule = {
        freq: 'WEEKLY',
        count: 10
      };
      this.initDirective(this.$scope);
      this.eleScope.selectEndRadioButton(2);
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
    });
  });

  describe('scope.setRRULE', function() {
    beforeEach(function() {
      this.initDirective(this.$scope);
    });

    it('should set rrule to undefined if scope.freq equal undefined', function() {
      this.eleScope.vm.freq = undefined;
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule).to.be.undefined;
    });

    it('should set rrule if scope is not undefined', function() {
      this.eleScope.vm.freq = 'WEEKLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule.freq).to.be.equal('WEEKLY');
    });

    it('should set the interval to one if it was not previously defined', function() {
      this.eleScope.vm.freq = 'WEEKLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule.interval).to.be.equal(1);
      this.eleScope.vm.event.rrule.interval = undefined;
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule.interval).to.be.equal(1);
    });

    it('should keep previous interval if it was defined and more than 0', function() {
      this.eleScope.vm.event.rrule = {freq: 'WEEKLY', interval: 42};
      this.eleScope.vm.freq = 'YEARLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule).to.be.deep.equals({freq: 'YEARLY', interval: 42});
      this.eleScope.vm.event.rrule.interval = 0;
      this.eleScope.vm.freq = 'WEEKLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule).to.be.deep.equals({freq: 'WEEKLY', interval: 1});
    });
  });

  describe('The setDefaultUntilDate function', function() {
    var dateCheck;
    var dateCurrent;

    beforeEach(function() {
      this.initDirective(this.$scope);
      dateCurrent = new Date();
      dateCheck = new Date();

      this.eleScope.vm.event = {
        rrule: {}
      };
    });

    it('should set until is next day if the frequency is "DAILY"', function() {
      dateCheck.setDate(dateCurrent.getDate() + 1);
      this.eleScope.vm.setDefaultUntilDate('DAILY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });

    it('should set until is next week if the frequency is "WEEKLY"', function() {
      dateCheck.setDate(dateCurrent.getDate() + 7);
      this.eleScope.vm.setDefaultUntilDate('WEEKLY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });

    it('should set until is next month if the frequency is "MONTHLY"', function() {
      dateCheck.setMonth(dateCurrent.getMonth() + 1);
      this.eleScope.vm.setDefaultUntilDate('MONTHLY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });

    it('should set until is next year if the frequency is "YEARLY"', function() {
      dateCheck.setFullYear(dateCurrent.getFullYear() + 1);
      this.eleScope.vm.setDefaultUntilDate('YEARLY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });
  });
});
