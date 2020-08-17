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

        return $q.when();
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

    angular.mock.module('esn.calendar.libs', function($provide) {
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
    it('should return calendars as it was saved in the localstorage', function(done) {
      var thenSpy = sinon.spy();
      var self = this;
      this.storageData.hiddenCalendarUniqueId = true;
      this.storageData.visibleCalendarUniqueId = false;
      this.calendarVisibilityService.getHiddenCalendars().then(thenSpy).then(function() {
        expect(thenSpy).to.have.been.calledWith(['hiddenCalendarUniqueId']);
        expect(self.localStorageServiceMock.getOrCreateInstance).to.have.been.calledWith('calendarStorage');
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });

    it('should not return unhidden calendar', function(done) {
      var id = '2';
      var hiddenCalendars = [this.getCalendar('1'), this.getCalendar(id)];
      var self = this;

      Promise.all(hiddenCalendars.map(this.calendarVisibilityService.toggle)).then(function() {
        self.calendarVisibilityService.toggle(hiddenCalendars[0]).then(function() {
          var thenSpy = sinon.spy();

          self.calendarVisibilityService.getHiddenCalendars().then(thenSpy);
          expect(thenSpy).to.have.been.calledWith([id]);
        });
      }).then(done).catch(done);
    });
  });

  describe('the toggle function', function() {
    it('should broadcast the calendar and it new display status', function(done) {
      var cal = this.getCalendar(42);
      var self = this;

      this.$rootScope.$broadcast = sinon.spy(this.$rootScope.$broadcast);

      this.calendarVisibilityService.toggle(cal).then(function() {
        expect(self.$rootScope.$broadcast).to.have.been.calledWith(
          self.CAL_EVENTS.CALENDARS.TOGGLE_VIEW,
          {calendarUniqueId: cal.uniqueId, hidden: true}
        );
        self.$rootScope.$broadcast.reset();

        self.calendarVisibilityService.toggle(cal).then(function() {
          expect(self.$rootScope.$broadcast).to.have.been.calledWith(
            self.CAL_EVENTS.CALENDARS.TOGGLE_VIEW,
            {calendarUniqueId: cal.uniqueId, hidden: false}
          );
        });
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });

    it('should correctly record hidden calendar in localforage', function(done) {
      var id1 = '1';
      var id2 = '2';
      var hiddenCalendars = [this.getCalendar(id1), this.getCalendar(id2)];
      var self = this;

      Promise.all(hiddenCalendars.map(this.calendarVisibilityService.toggle)).then(function() {
        var thenSpy = sinon.spy();
        self.calendarVisibilityService.getHiddenCalendars().then(function(res) {
          expect(thenSpy).to.have.been.calledWith([id1, id2]);
        });
      }).then(done).catch(done);
    });
  });

  describe('The isHidden function', function() {
    it('should return true if and only if the calendar is hidden', function(done) {
      var cal = this.getCalendar(42);
      var thenSpy = sinon.spy();
      var self = this;

      this.calendarVisibilityService.isHidden(cal).then(thenSpy).then(function() {
        expect(thenSpy).to.have.been.calledWith(false);
        thenSpy.reset();

        self.calendarVisibilityService.toggle(cal).then(function() {
          self.calendarVisibilityService.isHidden(cal).then(thenSpy).then(function() {
            expect(thenSpy).to.have.been.calledWith(true);
          });
        });
      }).then(done).catch(done);
    });
  });
});
