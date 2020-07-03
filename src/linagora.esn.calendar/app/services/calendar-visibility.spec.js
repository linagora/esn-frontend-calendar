'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calendarVisibilityService', function() {
  var self;

  beforeEach(function() {
    self = this;
    this.storageData = {};

    this.storage = {
      iterate: function(callback) {
        angular.forEach(self.storageData, callback);

        return self.$q.when();
      },
      getItem: function(id) {
        return $q.when(self.storageData[id]);
      },
      setItem: function(id, hidden) {
        self.storageData[id] = hidden;

        return $q.when(hidden);
      }
    };

    this.localStorageServiceMock = {
      getOrCreateInstance: sinon.stub().returns(this.storage)
    };

    this.getCalendar = function(id) {
      return {uniqueId: id, getUniqueId: function() { return id; }};
    };

    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('localStorageService', self.localStorageServiceMock);
    });
  });

  beforeEach(angular.mock.inject(function(calendarVisibilityService, $rootScope, CAL_EVENTS, $q) {
    self.calendarVisibilityService = calendarVisibilityService;
    self.$rootScope = $rootScope;
    self.CAL_EVENTS = CAL_EVENTS;
    self.$q = $q;
  }));

  describe('getHiddenCalendars function', function() {
    it('should return calendars as it was saved in the localstorage', function() {
      var thenSpy = sinon.spy();
      this.storageData.hiddenCalendarUniqueId = true;
      this.storageData.visibleCalendarUniqueId = false;
      this.calendarVisibilityService.getHiddenCalendars().then(thenSpy);

      this.$rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith(['hiddenCalendarUniqueId']);
      expect(this.localStorageServiceMock.getOrCreateInstance).to.have.been.calledWith('calendarStorage');
    });

    it('should not return unhidden calendar', function() {
      var id = '2';
      var hiddenCalendars = [this.getCalendar('1'), this.getCalendar(id)];

      hiddenCalendars.map(this.calendarVisibilityService.toggle);
      this.$rootScope.$digest();

      this.calendarVisibilityService.toggle(hiddenCalendars[0]);
      this.$rootScope.$digest();

      var thenSpy = sinon.spy();

      this.calendarVisibilityService.getHiddenCalendars().then(thenSpy);
      this.$rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith([id]);
    });
  });

  describe('the toggle function', function() {
    it('should broadcast the calendar and it new display status', function() {
      var cal = this.getCalendar(42);

      this.$rootScope.$broadcast = sinon.spy(this.$rootScope.$broadcast);

      this.calendarVisibilityService.toggle(cal);
      this.$rootScope.$digest();
      expect(this.$rootScope.$broadcast).to.have.been.calledWith(
        this.CAL_EVENTS.CALENDARS.TOGGLE_VIEW,
        {calendarUniqueId: cal.uniqueId, hidden: true}
      );

      this.$rootScope.$broadcast.reset();

      this.calendarVisibilityService.toggle(cal);
      this.$rootScope.$digest();
      expect(this.$rootScope.$broadcast).to.have.been.calledWith(
        this.CAL_EVENTS.CALENDARS.TOGGLE_VIEW,
        {calendarUniqueId: cal.uniqueId, hidden: false}
      );
    });

    it('should correctly record hidden calendar in localforage', function() {
      var id1 = '1';
      var id2 = '2';
      var hiddenCalendars = [this.getCalendar(id1), this.getCalendar(id2)];
      var thenSpy = sinon.spy();

      hiddenCalendars.map(this.calendarVisibilityService.toggle);
      this.$rootScope.$digest();
      this.calendarVisibilityService.getHiddenCalendars().then(thenSpy);
      this.$rootScope.$digest();

      expect(thenSpy).to.have.been.calledWith([id1, id2]);
    });
  });

  describe('The isHidden function', function() {
    it('should return true if and only if the calendar is hidden', function() {
      var cal = this.getCalendar(42);
      var thenSpy = sinon.spy();

      this.calendarVisibilityService.isHidden(cal).then(thenSpy);
      this.$rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith(false);

      thenSpy.reset();

      this.calendarVisibilityService.toggle(cal);
      this.$rootScope.$digest();

      this.calendarVisibilityService.isHidden(cal).then(thenSpy);
      this.$rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith(true);
    });
  });
});
